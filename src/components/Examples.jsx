import { Paper, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const Examples = () => {

  const { t, i18n } = useTranslation();

  return(
  <Paper elevation={2} style={{ padding: "10px", whiteSpace: "pre-wrap", backgroundColor: "#fafafa" }}>
    <Typography variant="h6" gutterBottom>
      {t("examples")}
    </Typography>

    <div style={{ display: "flex", flexDirection: "row", gap: "20px" }}>
      <div style={{ width: "20%" }}>
      <Typography variant="h6" gutterBottom>
          {t("testForEpsilon")}
        </Typography>
        <Typography variant="body1">
          S → A B C D{"\n"}
          A → C D | A C{"\n"}
          B → C b{"\n"}
          C → a | ε{"\n"}
          D → b D | ε{"\n"}
        </Typography>
      </div>

      <div style={{ width: "20%" }}>
        <Typography  variant="h6" gutterBottom sx={{ fontSize: i18n.language === "sk" ? "18.5px" : "20px" }}>
          {t("testForUnit")}
        </Typography>
        <Typography variant="body1">
            bexpr → bexpr or bterm | bterm{"\n"}
            bterm → bterm and bfactor{"\n"}| bfactor{"\n"}
            bfactor → not bfactor | ( bexpr ) | true | false
        </Typography>
      </div>

      <div style={{ width: "20%" }}>
        <Typography variant="h6" gutterBottom sx={{ fontSize: i18n.language === "sk" ? "18.5px" : "20px" }}>
          {t("testForUseless")}
        </Typography>
        <Typography variant="body1">
            S → A B | a{"\n"}
            A → b{"\n"}
            B → C
        </Typography>
      </div>

      <div style={{ width: "20%" }}>
        <Typography variant="h6" gutterBottomsx={{ fontSize: i18n.language === "sk" ? "18.5px" : "20px" }}>
          {t("testForLeftRecursion")}
        </Typography>
        <Typography variant="body1">
            A → B a | A a | c{"\n"}
            B → B b | A b | d
        </Typography>
      </div>

      <div style={{ width: "20%" }}>
        <Typography variant="h6" gutterBottom sx={{ fontSize: i18n.language === "sk" ? "18.5px" : "20px" }}>
          {t("testForCNF")}
        </Typography>
        <Typography variant="body1">
          S → A B A{"\n"}
          A → a A | ε{"\n"}
          B → b B c | ε
        </Typography>
      </div>
    </div>
  </Paper>
);
};

export default Examples;
