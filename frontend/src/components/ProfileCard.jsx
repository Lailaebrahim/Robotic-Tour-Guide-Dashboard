import * as React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import { Box } from "@mui/material";

const ProfileCard = ({ user }) => {
  return (
    <Card sx={{ maxWidth: 345 }}>
      <Box sx={{ display: "flex", justifyContent: "center", mt: -5 }}>
        <Avatar
          sx={{ width: 80, height: 80, border: "4px solid white" }}
          src={user.profileP}
          alt="Profile Picture"
        />
      </Box>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div" align="center">
          {user.firstName} {user.lastName}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          {user.role}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2 }}
        ></Typography>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
