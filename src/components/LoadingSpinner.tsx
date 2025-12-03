import { Spinner } from "@radix-ui/themes";

export function LoadingSpinner({
  backgroundColor = "var(--green-8)",
}: {
  backgroundColor?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor,
      }}
    >
      <Spinner size="3" />
    </div>
  );
}
