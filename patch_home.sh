sed -i "1i import Preloader from '../components/Preloader.js';" src/pages/Home.tsx
sed -i '/const \[featuredProducts, setFeaturedProducts\] = useState<Product\[\]>(\[\]);/a\
  const [loading, setLoading] = useState(true);' src/pages/Home.tsx

sed -i '/fetch(.*\/api\/products.featured=true/i\
    let fetched = 0;\
    const checkDone = () => { fetched++; if(fetched >= 2) setTimeout(() => setLoading(false), 500); };\
' src/pages/Home.tsx

sed -i 's/\.catch(err => {/& checkDone();/g' src/pages/Home.tsx
sed -i 's/setFeaturedProducts(data.products || \[\]);/setFeaturedProducts(data.products || \[\]); checkDone();/g' src/pages/Home.tsx
sed -i 's/setCategories(Array.isArray(data) ? data : \[\])/setCategories(Array.isArray(data) ? data : \[\]); checkDone();/g' src/pages/Home.tsx

sed -i '62i\
  if (loading) {\
    return <Preloader text="Preparing Experience..." fullScreen={true} />;\
  }\
' src/pages/Home.tsx
