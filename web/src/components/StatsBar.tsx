export default function StatsBar() {
  return (
    <div className="container" style={{ paddingTop: '0', marginTop: '-40px', position: 'relative', zIndex: 2 }}>
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-number">200+</span>
          <span className="stat-label">Products Reviewed</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">7</span>
          <span className="stat-label">Wellness Categories</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">50K+</span>
          <span className="stat-label">Monthly Readers</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">100%</span>
          <span className="stat-label">Unbiased Reviews</span>
        </div>
      </div>
    </div>
  );
}
