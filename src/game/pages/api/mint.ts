import { NextApiRequest, NextApiResponse } from "next";
import { mintBadge } from "../../lib/mint";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const tx = await mintBadge({
      name: "Cosmic Explorer Badge — Island One",
      attributes: {
        island: "Cosmic Isles — Island One",
        rarity: "Common",
        questCompleted: true,
        timestamp: Date.now(),
      },
    });

    res.status(200).json({ success: true, tx });
  } catch (e) {
    res.status(500).json({ error: e });
  }
}
