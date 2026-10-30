sed -i "1256i\\
  // Analytics Tracking\\
  app.post('/api/track', async (req: any, res: any) => {\\
    try {\\
      const { type } = req.body;\\
      const today = new Date().toISOString().split('T')[0];\\
      if (type === 'view') {\\
        await executeQuery(\"INSERT INTO metrics (date, views, sessions) VALUES (?, 1, 0) ON DUPLICATE KEY UPDATE views = views + 1\", [today]);\\
      } else if (type === 'session') {\\
        await executeQuery(\"INSERT INTO metrics (date, views, sessions) VALUES (?, 0, 1) ON DUPLICATE KEY UPDATE sessions = sessions + 1\", [today]);\\
      }\\
      res.json({ success: true });\\
    } catch (err: any) {\\
      res.status(500).json({ error: err.message });\\
    }\\
  });\\
" server.ts
