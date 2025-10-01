import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { stockMovementService } from '../../services/stockMovementService';
import { productService } from '../../services/productService';
import { clientService } from '../../services/clientService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Sections.css';
import './Reports.css';

const Reports = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const [activeReport, setActiveReport] = useState('sales');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  
  // Date range filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Data for dropdowns
  const [clients, setClients] = useState([]);
  const [categories, setCategories] = useState([]);

  // Set default date range (last 30 days)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  // Load clients and categories for filters
  useEffect(() => {
    const loadFilterData = async () => {
      try {
        const [clientsData, categoriesData] = await Promise.all([
          clientService.getClients(),
          productService.getCategories()
        ]);
        setClients(clientsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading filter data:', error);
      }
    };

    if (user) {
      loadFilterData();
    }
  }, [user]);

  const generateReport = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let data = null;

      switch (activeReport) {
        case 'sales':
          data = await generateSalesReport();
          break;
        case 'stock':
          data = await generateStockReport();
          break;
        case 'inventory':
          data = await generateInventoryReport();
          break;
        case 'client':
          data = await generateClientReport();
          break;
        case 'movements':
          data = await generateMovementsReport();
          break;
        default:
          throw new Error('Invalid report type');
      }

      setReportData(data);
    } catch (error) {
      setError(error.message);
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSalesReport = async () => {
    const salesData = await stockMovementService.getMovements({
      movementType: 'SALE',
      startDate,
      endDate,
      client: selectedClient || undefined
    });

    const totalSales = salesData.length;
    const totalQuantity = salesData.reduce((sum, sale) => sum + (sale.quantity || 0), 0);
    const totalRevenue = salesData.reduce((sum, sale) => {
      const product = sale.product;
      if (product && product.sellingPrice) {
        return sum + (sale.quantity * product.sellingPrice);
      }
      return sum;
    }, 0);

    // Group by product
    const salesByProduct = salesData.reduce((acc, sale) => {
      const productName = sale.product?.name || 'Unknown Product';
      if (!acc[productName]) {
        acc[productName] = { quantity: 0, revenue: 0, sales: 0 };
      }
      acc[productName].quantity += sale.quantity || 0;
      acc[productName].sales += 1;
      if (sale.product?.sellingPrice) {
        acc[productName].revenue += (sale.quantity || 0) * sale.product.sellingPrice;
      }
      return acc;
    }, {});

    return {
      type: 'sales',
      summary: { totalSales, totalQuantity, totalRevenue },
      details: salesData,
      byProduct: salesByProduct,
      dateRange: { startDate, endDate }
    };
  };

  const generateStockReport = async () => {
    const movements = await stockMovementService.getMovements({
      startDate,
      endDate
    });

    const purchases = movements.filter(m => m.movementType === 'PURCHASE');
    const sales = movements.filter(m => m.movementType === 'SALE');

    const totalPurchases = purchases.reduce((sum, p) => sum + (p.quantity || 0), 0);
    const totalSales = sales.reduce((sum, s) => sum + (s.quantity || 0), 0);
    const netStockChange = totalPurchases - totalSales;

    return {
      type: 'stock',
      summary: { totalPurchases, totalSales, netStockChange },
      details: movements,
      purchases,
      sales,
      dateRange: { startDate, endDate }
    };
  };

  const generateInventoryReport = async () => {
    const products = await productService.getProducts();
    const lowStockProducts = products.filter(p => (p.quantity || 0) <= 10);
    
    const totalProducts = products.length;
    const totalStockValue = products.reduce((sum, p) => {
      return sum + ((p.quantity || 0) * (p.purchasePrice || 0));
    }, 0);

    // Group by category
    const byCategory = products.reduce((acc, product) => {
      const categoryName = product.category?.name || 'Uncategorized';
      if (!acc[categoryName]) {
        acc[categoryName] = { count: 0, totalQuantity: 0, totalValue: 0 };
      }
      acc[categoryName].count += 1;
      acc[categoryName].totalQuantity += product.quantity || 0;
      acc[categoryName].totalValue += (product.quantity || 0) * (product.purchasePrice || 0);
      return acc;
    }, {});

    return {
      type: 'inventory',
      summary: { totalProducts, totalStockValue, lowStockCount: lowStockProducts.length },
      details: products,
      lowStockProducts,
      byCategory,
      dateRange: { startDate, endDate }
    };
  };

  const generateClientReport = async () => {
    const salesData = await stockMovementService.getMovements({
      movementType: 'SALE',
      startDate,
      endDate
    });

    const clientSales = salesData.reduce((acc, sale) => {
      const clientName = sale.client?.name || 'Unknown Client';
      if (!acc[clientName]) {
        acc[clientName] = { sales: 0, quantity: 0, revenue: 0 };
      }
      acc[clientName].sales += 1;
      acc[clientName].quantity += sale.quantity || 0;
      if (sale.product?.sellingPrice) {
        acc[clientName].revenue += (sale.quantity || 0) * sale.product.sellingPrice;
      }
      return acc;
    }, {});

    const totalClients = Object.keys(clientSales).length;
    const totalRevenue = Object.values(clientSales).reduce((sum, client) => sum + client.revenue, 0);

    return {
      type: 'client',
      summary: { totalClients, totalRevenue },
      details: salesData,
      clientSales,
      dateRange: { startDate, endDate }
    };
  };

  const generateMovementsReport = async () => {
    const movements = await stockMovementService.getMovements({
      startDate,
      endDate,
      product: selectedCategory || undefined
    });

    const movementsByType = movements.reduce((acc, movement) => {
      const type = movement.movementType || 'Unknown';
      if (!acc[type]) {
        acc[type] = { count: 0, quantity: 0 };
      }
      acc[type].count += 1;
      acc[type].quantity += movement.quantity || 0;
      return acc;
    }, {});

    return {
      type: 'movements',
      summary: { totalMovements: movements.length },
      details: movements,
      byType: movementsByType,
      dateRange: { startDate, endDate }
    };
  };

  const exportReport = async () => {
    if (!reportData) return;

    try {
      await generatePDFReport(reportData);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF report. Please try again.');
    }
  };

  const generatePDFReport = async (data) => {
    const { type, summary, dateRange, details } = data;
    
    // Create new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Colors
    const primaryColor = [59, 130, 246]; // Blue
    const secondaryColor = [107, 114, 128]; // Gray
    const accentColor = [16, 185, 129]; // Green
    
    // Add header (now async)
    await addPDFHeader(doc, type, dateRange, pageWidth);
    
    // Add summary section
    addPDFSummary(doc, summary, type, pageWidth);
    
    // Add details section
    if (details && details.length > 0) {
      addPDFDetails(doc, details, type, pageWidth);
    }
    
    // Add footer to all pages
    addPDFFooter(doc, user, pageWidth, pageHeight);
    
    // Save the PDF
    const fileName = `${type}_report_${startDate}_to_${endDate}.pdf`;
    doc.save(fileName);
  };

  const addPDFHeader = async (doc, reportType, dateRange, pageWidth) => {
    try {
      // Add Fabritech logo
      const logoResponse = await fetch('/logo.png');
      const logoBlob = await logoResponse.blob();
      const logoBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(logoBlob);
      });
      
      // Add logo image (30x20 size)
      doc.addImage(logoBase64, 'PNG', 20, 20, 30, 20);
    } catch (error) {
      console.warn('Could not load logo, using placeholder:', error);
      // Fallback to placeholder if logo fails to load
      doc.setFillColor(59, 130, 246);
      doc.rect(20, 20, 30, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('FABRI', 35, 32, { align: 'center' });
    }
    
    // Company name
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Fabritech', 60, 30);
    
    // System name
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text('Inventory Management System', 60, 37);
    
    // Report title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    const reportTitle = getReportTitle(reportType);
    doc.text(reportTitle, 60, 47);
    
    // Date range
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(`Period: ${formatDate(dateRange.startDate)} to ${formatDate(dateRange.endDate)}`, 60, 55);
    
    // Generated date
    doc.text(`Generated: ${new Date().toLocaleString()}`, 60, 61);
    
    // Line separator
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(20, 70, pageWidth - 20, 70);
  };

  const addPDFSummary = (doc, summary, reportType, pageWidth) => {
    let yPosition = 85;
    
    // Summary title
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', 20, yPosition);
    yPosition += 15;
    
    // Summary cards
    const summaryEntries = Object.entries(summary);
    const cardsPerRow = 3;
    const cardWidth = (pageWidth - 60) / cardsPerRow;
    
    summaryEntries.forEach(([key, value], index) => {
      const row = Math.floor(index / cardsPerRow);
      const col = index % cardsPerRow;
      const x = 20 + (col * (cardWidth + 10));
      const y = yPosition + (row * 35);
      
      // Card background
      doc.setFillColor(248, 250, 252);
      doc.rect(x, y, cardWidth, 30, 'F');
      
      // Card border
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.5);
      doc.rect(x, y, cardWidth, 30);
      
      // Value
      doc.setTextColor(31, 41, 55);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      const displayValue = typeof value === 'number' ? value.toLocaleString() : value;
      doc.text(displayValue, x + cardWidth/2, y + 15, { align: 'center' });
      
      // Label
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(107, 114, 128);
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      doc.text(label, x + cardWidth/2, y + 25, { align: 'center' });
    });
    
    // Add space after summary
    const totalRows = Math.ceil(summaryEntries.length / cardsPerRow);
    return yPosition + (totalRows * 35) + 20;
  };

  const addPDFDetails = (doc, details, reportType, pageWidth) => {
    let yPosition = 155;
    
    // Details title
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Report', 20, yPosition);
    yPosition += 15;
    
    // Prepare table data
    const tableData = prepareTableData(details, reportType);
    const columns = getTableColumns(reportType);
    
    // Add table
    autoTable(doc, {
      startY: yPosition,
      head: [columns],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [31, 41, 55]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: 20, right: 20 },
      tableWidth: 'auto',
      columnStyles: getColumnStyles(reportType)
    });
  };

  const addPDFFooter = (doc, user, pageWidth, pageHeight) => {
    const pageCount = doc.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer line
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.5);
      doc.line(20, pageHeight - 30, pageWidth - 20, pageHeight - 30);
      
      // Generated by
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(107, 114, 128);
      doc.text(`Generated by: ${user?.name || 'System User'} (${user?.role || 'User'})`, 20, pageHeight - 20);
      
      // Page number
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, pageHeight - 20, { align: 'right' });
      
      // Company info
      doc.text('© 2025 Fabritech - Inventory Management System', pageWidth/2, pageHeight - 20, { align: 'center' });
    }
  };

  const getReportTitle = (reportType) => {
    const titles = {
      'sales': 'Sales Performance Report',
      'stock': 'Stock Movement Report',
      'inventory': 'Inventory Status Report',
      'client': 'Client Activity Report',
      'movements': 'Complete Movement Report'
    };
    return titles[reportType] || 'Report';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const prepareTableData = (details, reportType) => {
    return details.slice(0, 50).map((item, index) => {
      switch (reportType) {
        case 'sales':
          return [
            index + 1,
            item.product?.name || 'Unknown Product',
            item.client?.name || 'Unknown Client',
            item.quantity || 0,
            item.product?.sellingPrice ? `${(item.product.sellingPrice * item.quantity).toLocaleString()} RWF` : 'N/A',
            formatDate(item.createdAt)
          ];
        case 'stock':
        case 'movements':
          return [
            index + 1,
            item.movementType || 'Unknown',
            item.product?.name || 'Unknown Product',
            item.quantity || 0,
            item.client?.name || '-',
            formatDate(item.createdAt)
          ];
        case 'inventory':
          return [
            index + 1,
            item.name || 'Unknown Product',
            item.category?.name || 'Uncategorized',
            item.quantity || 0,
            `${(item.purchasePrice || 0).toLocaleString()} RWF`,
            `${((item.quantity || 0) * (item.purchasePrice || 0)).toLocaleString()} RWF`
          ];
        case 'client':
          return [
            index + 1,
            item.client?.name || 'Unknown Client',
            item.product?.name || 'Unknown Product',
            item.quantity || 0,
            item.product?.sellingPrice ? `${(item.product.sellingPrice * item.quantity).toLocaleString()} RWF` : 'N/A',
            formatDate(item.createdAt)
          ];
        default:
          return [index + 1, 'Data', 'N/A', 'N/A', 'N/A', 'N/A'];
      }
    });
  };

  const getTableColumns = (reportType) => {
    const columns = {
      'sales': ['#', 'Product', 'Client', 'Quantity', 'Revenue', 'Date'],
      'stock': ['#', 'Type', 'Product', 'Quantity', 'Client', 'Date'],
      'movements': ['#', 'Type', 'Product', 'Quantity', 'Client', 'Date'],
      'inventory': ['#', 'Product', 'Category', 'Quantity', 'Unit Price', 'Total Value'],
      'client': ['#', 'Client', 'Product', 'Quantity', 'Revenue', 'Date']
    };
    return columns[reportType] || ['#', 'Item', 'Details', 'Quantity', 'Value', 'Date'];
  };

  const getColumnStyles = (reportType) => {
    const styles = {
      'sales': { 0: { halign: 'center' }, 3: { halign: 'center' }, 4: { halign: 'right' }, 5: { halign: 'center' } },
      'stock': { 0: { halign: 'center' }, 3: { halign: 'center' }, 5: { halign: 'center' } },
      'movements': { 0: { halign: 'center' }, 3: { halign: 'center' }, 5: { halign: 'center' } },
      'inventory': { 0: { halign: 'center' }, 3: { halign: 'center' }, 4: { halign: 'right' }, 5: { halign: 'right' } },
      'client': { 0: { halign: 'center' }, 3: { halign: 'center' }, 4: { halign: 'right' }, 5: { halign: 'center' } }
    };
    return styles[reportType] || { 0: { halign: 'center' } };
  };

  const reportTypes = [
    { id: 'sales', name: 'Sales Report', icon: '💰', description: 'Sales performance and revenue analysis' },
    { id: 'stock', name: 'Stock Movement', icon: '📈', description: 'Stock in/out movements and changes' },
    { id: 'inventory', name: 'Inventory Report', icon: '📦', description: 'Current inventory status and value' },
    { id: 'client', name: 'Client Activity', icon: '👥', description: 'Client purchase history and activity' },
    { id: 'movements', name: 'All Movements', icon: '🔄', description: 'Complete movement history' }
  ];

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="section-container">
        <div className="loading-message">
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="section-container">
      <div className="section-header">
        <div className="header-content">
          <div>
        <h1>Reports & Analytics</h1>
            <p>Generate comprehensive reports and analytics for your inventory management.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}
      
      <div className="section-content">
        {/* Report Type Selection */}
        <div className="report-types">
          {reportTypes.map((report) => (
            <div
              key={report.id}
              className={`report-type-card ${activeReport === report.id ? 'active' : ''}`}
              onClick={() => setActiveReport(report.id)}
            >
              <div className="report-icon">{report.icon}</div>
              <div className="report-info">
                <h3>{report.name}</h3>
                <p>{report.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="report-filters">
          <div className="filter-group">
            <label>Date Range:</label>
            <div className="date-inputs">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="date-input"
              />
              <span>to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="date-input"
              />
            </div>
          </div>

          {activeReport === 'sales' && (
            <div className="filter-group">
              <label>Client:</label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="filter-select"
              >
                <option value="">All Clients</option>
                {clients.map(client => (
                  <option key={client._id} value={client._id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeReport === 'movements' && (
            <div className="filter-group">
              <label>Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="filter-actions">
            <button
              onClick={generateReport}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
            
            {reportData && (
              <button
                onClick={exportReport}
                className="btn btn-secondary"
              >
                📄 Generate PDF Report
              </button>
            )}
          </div>
        </div>

        {/* Report Results */}
        {reportData && (
          <div className="report-results">
            <div className="report-summary">
              <h3>Report Summary</h3>
              <div className="summary-cards">
                {Object.entries(reportData.summary).map(([key, value]) => (
                  <div key={key} className="summary-card">
                    <div className="summary-value">
                      {typeof value === 'number' ? value.toLocaleString() : value}
                    </div>
                    <div className="summary-label">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="report-details">
              <h3>Report Details</h3>
              <div className="details-content">
                {reportData.details && reportData.details.length > 0 ? (
                  <div className="details-list">
                    {reportData.details.slice(0, 20).map((item, index) => (
                      <div key={index} className="detail-item">
                        <div className="detail-info">
                          <span className="detail-type">
                            {item.movementType || 'Product'}
                          </span>
                          <span className="detail-name">
                            {item.product?.name || item.client?.name || 'Unknown'}
                          </span>
                          <span className="detail-quantity">
                            Qty: {item.quantity || 'N/A'}
                          </span>
                        </div>
                        <div className="detail-date">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                    {reportData.details.length > 20 && (
                      <div className="more-items">
                        ... and {reportData.details.length - 20} more items
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="no-data">
                    No data available for the selected criteria.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;