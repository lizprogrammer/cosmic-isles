import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const body = JSON.parse(req.body);

  await supabase.from("progress").insert({
    questCompleted: body.questCompleted,
    timestamp: new Date(),
  });

  res.status(200).json({ ok: true });
}
