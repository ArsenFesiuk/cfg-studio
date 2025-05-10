import { Button } from "@mui/material";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

const ImportFile = ({ onFileImport }) => {
  const fileInputRef = useRef(null);
  const { t } = useTranslation();

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        const fileContent = reader.result;

        // Передаємо вміст файлу
        onFileImport(fileContent);

        // Скидаємо значення input, щоб дозволити імпорт того ж файлу знову
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      };

      reader.onerror = () => {
        alert("Помилка при читанні файлу");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      };

      reader.readAsText(file);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".txt"
        onChange={handleImport}
        ref={fileInputRef}
        style={{ display: "none" }}
        id="file-input"
      />
      <Button
        variant="contained"
        onClick={() => document.getElementById("file-input").click()}
        sx={{ backgroundColor: "contained", color: "white", height: "60px", width: "230px"}}
      >
        {t("ImportGrammar")}
      </Button>
    </div>
  );
};

export default ImportFile;
