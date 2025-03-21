import React, { ReactNode } from "react";
import { Box, Button } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";
import { styled } from "@stitches/react";

interface PageContainerProps {
  children: ReactNode;
  backgroundColor?: string;
  nextPage?: string;
}

const PageContainer = ({
  children,
  backgroundColor = "var(--purple-8)",
  nextPage,
}: PageContainerProps) => {
  const navigate = useNavigate();

  return (
    <Box style={{ backgroundColor }} className="min-h-screen pb-12">
      {children}

      {nextPage && (
        <NavButtonContainer>
          <Button
            size={"4"}
            style={{ width: "100%" }}
            onClick={() => {
              void navigate(nextPage);
            }}
          >
            Next
          </Button>
        </NavButtonContainer>
      )}
    </Box>
  );
};

const NavButtonContainer = styled("div", {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 10,
});

export default PageContainer;
