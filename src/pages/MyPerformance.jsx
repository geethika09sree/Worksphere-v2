import React from "react";

import {
  Box,
  Card,
  Chip,
  Rating,
  Typography,
} from "@mui/material";

import { useGetMyPerformanceQuery } from "../redux/workforceApi";

export default function MyPerformance() {
  const { data } = useGetMyPerformanceQuery();

  const myReviews = (data?.records || []).map((review) => ({
    id: review._id,
    date: review.reviewPeriod || new Date(review.createdAt).toISOString().split("T")[0],
    rating: review.rating,
    comments: review.feedback || review.achievements || "",
  }));

  return (
    <Box className="page-container">

      <Typography className="page-title">
        My Performance
      </Typography>

      <Typography className="page-subtitle">
        View performance reviews and feedback
        from HR.
      </Typography>


      {myReviews.length === 0 ? (

        <Card
          sx={{
            p: 5,
            borderRadius: 3,
            textAlign: "center",
          }}
        >

          <Typography
            variant="h6"
            fontWeight={700}
            mb={1}
          >
            No performance reviews yet
          </Typography>

          <Typography color="text.secondary">
            Your HR performance reviews will
            appear here.
          </Typography>

        </Card>

      ) : (

        myReviews
          .slice()
          .reverse()
          .map((review) => (

            <Card
              key={review.id}
              sx={{
                p: 3,
                borderRadius: 3,
                mb: 2,
              }}
            >

              <Box
                sx={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "flex-start",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >

                <Box>

                  <Typography
                    variant="h6"
                    fontWeight={700}
                  >
                    HR Performance Review
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {review.date}
                  </Typography>

                </Box>


                <Chip
                  label={`${review.rating}/5`}
                  sx={{
                    backgroundColor:
                      "#F9E9EE",
                    color: "#800020",
                    fontWeight: 700,
                  }}
                />

              </Box>


              <Box sx={{ mt: 2 }}>

                <Rating
                  value={Number(
                    review.rating
                  )}
                  readOnly
                />

              </Box>


              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  backgroundColor: "#F8FAFC",
                  borderRadius: 2,
                }}
              >

                <Typography
                  variant="body2"
                  fontWeight={700}
                  mb={0.5}
                >
                  HR Feedback
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {review.comments ||
                    "No comments provided."}
                </Typography>

              </Box>

            </Card>

          ))

      )}

    </Box>
  );
}
