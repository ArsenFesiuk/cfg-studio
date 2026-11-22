import React from "react";
import { Box } from "@mui/material";
import { cv } from "../theme/theme.js";

// One look for every table in the app (iteration tables, parse table,
// FIRST/FOLLOW/PREDICT results): rounded card, header band, zebra rows and an
// optional highlighted row. Cells are plain content or `{ content, sx }`.
export default function DataTable({ head, rows, activeRow = -1, firstColumnStrong = false, mono = false }) {
  return (
    <Box
      sx={{
        display: "inline-block",
        maxWidth: "100%",
        overflowX: "auto",
        verticalAlign: "top",
        border: `1px solid ${cv.border}`,
        borderRadius: "8px",
        my: 1,
      }}
    >
      <Box
        component="table"
        sx={{
          borderCollapse: "separate",
          borderSpacing: 0,
          fontSize: "0.82rem",
          fontFamily: mono ? "monospace" : "Arial, sans-serif",
          color: cv.text,
          "& th, & td": {
            textAlign: "left",
            whiteSpace: "nowrap",
            px: 1.5,
            py: 0.75,
            borderBottom: `1px solid ${cv.border}`,
          },
          "& tbody tr:last-of-type td": { borderBottom: "none" },
          "& th": { backgroundColor: cv.surfaceAlt, color: cv.heading, fontWeight: 700 },
        }}
      >
        <thead>
          <tr>
            {head.map((cell, i) => (
              <th key={i}>{cell}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <Box
              component="tr"
              key={r}
              sx={{
                backgroundColor: r === activeRow ? cv.activeLine : r % 2 ? cv.inputBg : "transparent",
              }}
            >
              {row.map((cell, c) => {
                const { content, sx } =
                  cell !== null && typeof cell === "object" && "content" in cell ? cell : { content: cell };
                return (
                  <Box
                    component="td"
                    key={c}
                    sx={{ fontWeight: firstColumnStrong && c === 0 ? 700 : 400, ...sx }}
                  >
                    {content}
                  </Box>
                );
              })}
            </Box>
          ))}
        </tbody>
      </Box>
    </Box>
  );
}
