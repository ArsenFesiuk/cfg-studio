import React from "react";
import { Alert } from "@mui/material";
import { useTranslation } from "react-i18next";

function Fallback() {
  const { t } = useTranslation();
  return <Alert severity="error">{t("stepsRenderError")}</Alert>;
}

// Keeps a failure inside one panel (e.g. while rendering algorithm steps) from
// blanking the whole app. Re-mounting via `resetKey` clears the error state.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidUpdate(prevProps) {
    if (this.state.failed && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ failed: false });
    }
  }

  render() {
    if (this.state.failed) {
      return <Fallback />;
    }
    return this.props.children;
  }
}
