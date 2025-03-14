import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { getBCV } from "../services/BCVService";

export default function BCVDay() {
  const [bcv, setBCV] = useState(null);

  useEffect(() => {
    getBCV().then((v) => setBCV(v));
  }, [bcv]);
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        my: 1,
      }}
    >
      {bcv && (
        <Typography
          variant="h6"
        >
          <strong>BCV:</strong>
          &nbsp;
          {bcv}
          &nbsp;
          {new Date().getDate()}/{new Date().getMonth() + 1}/
          {new Date().getFullYear()}
        </Typography>
      )}
    </Box>
  );
}
