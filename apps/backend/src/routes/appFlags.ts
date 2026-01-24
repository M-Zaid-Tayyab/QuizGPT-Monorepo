import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  try {
    const flags = {
      paywall: {
        showWeeklyCalculation: false,
      },
      version: {
        minimumVersion: "1.4.0",
        latestVersion: "1.4.0",
        forceUpdate: false,
      },
    };

    res.json(flags);
  } catch (error) {
    console.error("Error fetching app flags:", error);
    res.status(500).json({
      error: "Failed to fetch app flags",
    });
  }
});

export default router;
