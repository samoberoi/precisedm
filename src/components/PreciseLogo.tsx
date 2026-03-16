const PreciseLogo = ({ size = 80 }: { size?: number }) => (
  <div
    className="rounded-2xl flex items-center justify-center bg-primary"
    style={{ width: size, height: size }}
  >
    <span
      className="font-bold text-primary-foreground"
      style={{ fontSize: size * 0.3 }}
    >
      P
    </span>
  </div>
);

export default PreciseLogo;
