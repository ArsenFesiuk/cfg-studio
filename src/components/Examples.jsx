import { Button, Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const Examples = ({ onExampleSelect }) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSelect = (exampleText) => {
    setAnchorEl(null);
    if (onExampleSelect) {
      onExampleSelect(exampleText); // передаємо тільки текст граматики
    }
  };

  return (
    <>
      <Button
        variant="contained"
        onClick={handleClick}
        sx={{ backgroundColor: "contained", color: "white", height: "60px", width: "230px"}}
      >
        {t("examples")}
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => handleSelect(`S → A B C D\nA → C D | A C\nB → C b\nC → a | ε\nD → b D | ε`)}>
          {t("testForEpsilon")}
        </MenuItem>
        <MenuItem onClick={() => handleSelect(`S → A B | A | B\nA → a A A | a A | a\nB → b B B | b B | b`)}>
          {t("testForUnit")}
        </MenuItem>
        <MenuItem onClick={() => handleSelect(`S → A B | a\nA → b\nB → C`)}>
          {t("testForUseless")}
        </MenuItem>
        <MenuItem onClick={() => handleSelect(`A → B a | A a | c\nB → B b | A b | d`)}>
          {t("testForLeftRecursion")}
        </MenuItem>
        <MenuItem onClick={() => handleSelect(`S → A B A\nA → a A | ε\nB → b B c | ε`)}>
          {t("testForCNF")}
        </MenuItem>
      </Menu>
    </>
  );
};

export default Examples;
