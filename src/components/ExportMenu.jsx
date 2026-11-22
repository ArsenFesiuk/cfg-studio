import { useState } from "react";
import { Button, Menu, MenuItem } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { useTranslation } from "react-i18next";
import { actionButtonSx } from "../theme/theme.js";

const ExportMenu = ({ inputText, outputText, isValidGrammar }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const { t } = useTranslation();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const downloadFile = (text, filename) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Button
        variant="contained"
        onClick={handleMenuOpen}
        startIcon={<FileDownloadIcon />}
        sx={actionButtonSx}
      >
        {t("ExportGrammar")}
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            downloadFile(inputText, "grammar-input.txt");
            handleMenuClose();
          }}
          disabled={!isValidGrammar}
        >
        {t("ExportInput")}
        </MenuItem>
        <MenuItem
          onClick={() => {
            downloadFile(outputText, "grammar-output.txt");
            handleMenuClose();
          }}
          disabled={!outputText?.trim()}
        >
          {t("ExportOutput")}
        </MenuItem>
      </Menu>
    </>
  );
};

export default ExportMenu;
