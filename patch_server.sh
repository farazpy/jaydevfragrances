sed -i "1232,1266c\\
  app.get('/api/admin/stats', requireAuth, requireAdmin, async (req: any, res: any) => {\\
    try {\\
      const totalSalesRes = await executeQuery<any>(\"SELECT SUM(grand_total) as total FROM orders WHERE payment_status = 'Paid'\");\\
      const totalOrdersRes = await executeQuery<any>(\"SELECT COUNT(*) as count FROM orders\");\\
      const totalUsersRes = await executeQuery<any>(\"SELECT COUNT(*) as count FROM users WHERE role = 'customer'\");\\
      const totalProductsRes = await executeQuery<any>(\"SELECT COUNT(*) as count FROM products\");\\
      \\
      const lowStockRes = await executeQuery<any>(\"SELECT id, name, stock_quantity FROM products WHERE stock_quantity <= 10\");\\
      \\
      const metricsRes = await executeQuery<any>(\"SELECT SUM(views) as views, SUM(sessions) as sessions FROM metrics\");\\
      \\
      res.json({\\
        revenue: parseFloat(totalSalesRes[0]?.total || 0),\\
        ordersCount: totalOrdersRes[0]?.count || 0,\\
        usersCount: totalUsersRes[0]?.count || 0,\\
        productsCount: totalProductsRes[0]?.count || 0,\\
        views: metricsRes[0]?.views || 0,\\
        sessions: metricsRes[0]?.sessions || 0,\\
        lowStockVariants: lowStockRes\\
      });" server.ts
