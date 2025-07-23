const express = require('express');

// Export a function that takes the database connection
module.exports = (db) => {
  const router = express.Router();

// POST /start-auction
router.post('/start-auction', async (req, res) => {
  try {
    const { car_id, seller_id, start_price, duration_hours } = req.body;
    const now = new Date();
    const endTime = new Date(now.getTime() + duration_hours * 60 * 60 * 1000);

    db.query(
      `INSERT INTO auctions (car_id, seller_id, start_price, current_bid, start_time, end_time, status)
       VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      [car_id, seller_id, start_price, null, now, endTime],
      (err, result) => {
        if (err) {
          console.error('[Auction Create Error]', err);
          return res.status(500).json({ error: 'Failed to create auction' });
        }
        res.status(201).json({ message: 'Auction created' });
      }
    );
  } catch (err) {
    console.error('[Auction Create Error]', err);
    res.status(500).json({ error: 'Failed to create auction' });
  }
});

// GET /auctions/live
router.get('/auctions/live', async (req, res) => {
  try {
    const now = new Date();
    db.query(
      `SELECT a.*, c.manufacturer, c.model, c.year, c.price as original_price, c.image_path,
              c.fuel, c.transmission, c.engine_cubic, c.horsepower, c.color,
              COUNT(b.bid_id) as bid_count,
              TIMESTAMPDIFF(MINUTE, NOW(), a.end_time) as minutes_remaining,
              TIMESTAMPDIFF(HOUR, NOW(), a.end_time) as hours_remaining,
              CASE 
                WHEN TIMESTAMPDIFF(MINUTE, NOW(), a.end_time) < 60 
                THEN CONCAT(TIMESTAMPDIFF(MINUTE, NOW(), a.end_time), 'm left')
                WHEN TIMESTAMPDIFF(HOUR, NOW(), a.end_time) < 24
                THEN CONCAT(TIMESTAMPDIFF(HOUR, NOW(), a.end_time), 'h ', 
                           MOD(TIMESTAMPDIFF(MINUTE, NOW(), a.end_time), 60), 'm left')
                ELSE CONCAT(TIMESTAMPDIFF(DAY, NOW(), a.end_time), 'd left')
              END as time_left_formatted
       FROM auctions a
       JOIN cars c ON a.car_id = c.id
       LEFT JOIN bids b ON a.auction_id = b.auction_id
       WHERE a.status = 'active' AND a.start_time <= ? AND a.end_time > ?
       GROUP BY a.auction_id
       ORDER BY a.end_time ASC`,
      [now, now],
      (err, rows) => {
        if (err) {
          console.error('[Live Auctions Error]', err);
          return res.status(500).json({ error: 'Failed to fetch live auctions' });
        }
        res.json(rows);
      }
    );
  } catch (err) {
    console.error('[Live Auctions Error]', err);
    res.status(500).json({ error: 'Failed to fetch live auctions' });
  }
});

// GET /auctions/ending-soon
router.get('/auctions/ending-soon', async (req, res) => {
  try {
    const now = new Date();
    const halfHourFromNow = new Date(now.getTime() + 30 * 60 * 1000);
    db.query(
      `SELECT a.*, c.manufacturer, c.model, c.year, c.price as original_price, c.image_path,
              c.fuel, c.transmission, c.engine_cubic, c.horsepower, c.color,
              COUNT(b.bid_id) as bid_count,
              TIMESTAMPDIFF(MINUTE, NOW(), a.end_time) as minutes_remaining,
              TIMESTAMPDIFF(HOUR, NOW(), a.end_time) as hours_remaining,
              CASE 
                WHEN TIMESTAMPDIFF(MINUTE, NOW(), a.end_time) < 60 
                THEN CONCAT(TIMESTAMPDIFF(MINUTE, NOW(), a.end_time), 'm left')
                WHEN TIMESTAMPDIFF(HOUR, NOW(), a.end_time) < 24
                THEN CONCAT(TIMESTAMPDIFF(HOUR, NOW(), a.end_time), 'h ', 
                           MOD(TIMESTAMPDIFF(MINUTE, NOW(), a.end_time), 60), 'm left')
                ELSE CONCAT(TIMESTAMPDIFF(DAY, NOW(), a.end_time), 'd left')
              END as time_left_formatted
       FROM auctions a
       JOIN cars c ON a.car_id = c.id
       LEFT JOIN bids b ON a.auction_id = b.auction_id
       WHERE a.status = 'active' AND a.end_time > ? AND a.end_time <= ?
       GROUP BY a.auction_id
       ORDER BY a.end_time ASC`,
      [now, halfHourFromNow],
      (err, rows) => {
        if (err) {
          console.error('[Ending Soon Auctions Error]', err);
          return res.status(500).json({ error: 'Failed to fetch ending soon auctions' });
        }
        res.json(rows);
      }
    );
  } catch (err) {
    console.error('[Ending Soon Auctions Error]', err);
    res.status(500).json({ error: 'Failed to fetch ending soon auctions' });
  }
});

  return router;
}; 