import { products } from '../products/catalog.js';

const slug = new URLSearchParams(location.search).get('product');
if (slug !== null) {
  const entry = products.get(slug);
  const error = document.getElementById('catalog-error');
  if (!entry) {
    error.textContent = 'Assembly not found';
    error.hidden = false;
  } else {
    const catalog = document.getElementById('catalog');
    const header = document.getElementById('studio-header');
    const studio = document.getElementById('studio-main');
    try {
      const { default: product } = await entry.load();
      document.title = `${entry.name} Assembly Studio · FLAT / FORM`;
      document.getElementById('product-name').textContent = entry.name;
      const {mountGuide} = await import('./guide.js');
      catalog.hidden = true;
      header.hidden = studio.hidden = false;
      document.body.classList.add('has-studio');
      mountGuide(slug, entry, product);
    } catch {
      document.body.classList.remove('has-studio');
      header.hidden = studio.hidden = true;
      catalog.hidden = false;
      error.textContent = `Could not load the ${entry.name} assembly. Use the official manual below.`;
      error.hidden = false;
    }
  }
}
