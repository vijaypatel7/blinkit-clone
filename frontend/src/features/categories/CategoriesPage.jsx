import React from 'react';
import { Link } from 'react-router-dom';
import { useGetCategoryTreeQuery } from '../../store/api.js';
import { LazyImage } from '../../components/common/LazyImage.jsx';
import { FullScreenLoader } from '../../components/common/FullScreenLoader.jsx';
import { categoryImage } from '../../constants/index.js';

/**
 * CategoriesPage — full category grid with real image tiles.
 */
export function CategoriesPage() {
  const { data: categories, isLoading } = useGetCategoryTreeQuery();

  if (isLoading) return <FullScreenLoader />;

  return (
    <div className="container" style={{ paddingTop: 20 }}>
      <h1 style={{ fontSize: 22, marginBottom: 16 }}>Shop by category</h1>
      <div style={styles.grid}>
        {categories?.map((cat) => (
          <Link key={cat.id} to={`/categories/${cat.id}`} style={styles.card} aria-label={cat.name}>
            {/* Blinkit tile images already contain the category name, so we
                render the image only (at its native 270×396 portrait ratio,
                otherwise `cover` would crop the label off the top). */}
            <LazyImage src={categoryImage(cat)} alt={cat.name} ratio="270 / 396" style={{ borderRadius: 12 }} />
          </Link>
        ))}
      </div>
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: 16,
    padding: '12px 0 16px',
  },
  card: {
    display: 'block',
    textDecoration: 'none',
    color: '#1c1c1c',
  },
};
