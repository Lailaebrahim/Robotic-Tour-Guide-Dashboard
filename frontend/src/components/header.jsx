import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../theme";
import PropTypes from "prop-types";

const Header = ({ title, subtitle }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Box mb="20px;">
      <Typography
        variant="h2"
        color={colors.grey[100]}
        style={{ fontWeight: "bold" }}
        sx={{ mb: "5px" }}
      >
        {title}
      </Typography>
      <Typography variant="h5" color={colors.greenAccent[100]}>
        {subtitle}
      </Typography>
    </Box>
  );
};
Header.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
};

export default Header;
