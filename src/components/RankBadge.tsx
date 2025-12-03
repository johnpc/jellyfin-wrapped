export function RankBadge({ rank }: { rank: number }) {
  return (
    <div
      style={{
        position: "relative",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        borderRadius: "50%",
        width: "30px",
        height: "30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontWeight: "bold",
        marginBottom: "-15px",
        zIndex: 1,
        marginLeft: "10px",
      }}
    >
      #{rank}
    </div>
  );
}
