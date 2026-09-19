"use strict";

const PIXAZO_URL =
  "https://gateway.pixazo.ai/tracks/v1/generate";

const PIXAZO_STATUS_URL =
  "https://gateway.pixazo.ai/v2/requests/status";

module.exports = async function handler(req, res) {

  // Autoriser uniquement POST
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Méthode non autorisée. Utilise POST."
    });
  }

  // Vérifier la clé secrète
  const apiKey = process.env.PIXAZO_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "PIXAZO_API_KEY n'est pas configurée dans Vercel."
    });
  }

  try {

    const body = req.body || {};

    /*
      =====================================================
      ACTION 1 : GÉNÉRER UNE MUSIQUE
      =====================================================
    */

    if (!body.action || body.action === "generate") {

      const prompt = String(body.prompt || "").trim();

      if (!prompt) {
        return res.status(400).json({
          error: "Le prompt est obligatoire."
        });
      }

      const duration = Number(body.duration || 30);

      if (duration < 10 || duration > 600) {
        return res.status(400).json({
          error: "La durée doit être entre 10 et 600 secondes."
        });
      }

      const lyrics = String(body.lyrics || "");

      const instrumental = Boolean(
        body.instrumental || false
      );

      const bpm =
        body.bpm !== undefined && body.bpm !== ""
          ? Number(body.bpm)
          : undefined;

      const key = String(body.key || "");

      const timeSignature =
        String(body.time_signature || "4/4");

      const data = {
        prompt,
        lyrics,
        instrumental,
        duration,
        time_signature: timeSignature
      };

      if (bpm) {
        data.bpm = bpm;
      }

      if (key) {
        data.key = key;
      }

      const response = await fetch(PIXAZO_URL, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          "Ocp-Apim-Subscription-Key": apiKey
        },

        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({
          error:
            result.message ||
            result.error ||
            "Erreur Pixazo.",
          details: result
        });
      }

      return res.status(200).json({
        success: true,
        request_id: result.request_id,
        status: result.status,
        message: "Génération lancée.",
        polling_url: result.polling_url
      });
    }


    /*
      =====================================================
      ACTION 2 : VÉRIFIER LE STATUT
      =====================================================
    */

    if (body.action === "status") {

      const requestId = String(
        body.request_id || ""
      ).trim();

      if (!requestId) {
        return res.status(400).json({
          error: "request_id obligatoire."
        });
      }

      const response = await fetch(
        `${PIXAZO_STATUS_URL}/${encodeURIComponent(requestId)}`,
        {
          method: "GET",

          headers: {
            "Ocp-Apim-Subscription-Key": apiKey
          }
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({
          error:
            result.message ||
            result.error ||
            "Impossible de récupérer le statut.",
          details: result
        });
      }

      /*
        Quand la génération est terminée,
        Pixazo renvoie notamment :

        status: COMPLETED

        output:
        {
          media_url: [...]
        }
      */

      let audioUrl = null;

      if (
        result.output &&
        Array.isArray(result.output.media_url) &&
        result.output.media_url.length > 0
      ) {
        audioUrl = result.output.media_url[0];
      }

      return res.status(200).json({
        success: true,
        request_id: requestId,
        status: result.status,
        audioUrl,
        output: result.output || null,
        error: result.error || null
      });
    }


    /*
      =====================================================
      ACTION INCONNUE
      =====================================================
    */

    return res.status(400).json({
      error: "Action inconnue."
    });

  } catch (error) {

    console.error("JASON MUSIC ERROR:", error);

    return res.status(500).json({
      error: "Erreur interne du serveur.",
      message: error.message
    });
  }
};