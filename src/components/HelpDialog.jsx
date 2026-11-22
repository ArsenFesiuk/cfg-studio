import React from "react";
import { Button, Dialog, DialogActions, DialogContent } from "@mui/material";
import { useTranslation } from "react-i18next";
import SupportedGrammars from "./SupportedGrammars.jsx";

// The application guide, reachable at any time from the app bar (the right
// panel only shows it until an algorithm has been run).
export default function HelpDialog({ open, onClose }) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth aria-label={t("help")}>
      <DialogContent sx={{ p: 0 }}>
        <SupportedGrammars />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} autoFocus>
          {t("close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
