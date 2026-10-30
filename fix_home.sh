sed -i 's/setCategories(Array.isArray(data) ? data : \[\]); checkDone();)/setCategories(Array.isArray(data) ? data : \[\])/g' src/pages/Home.tsx
sed -i 's/\.catch(err => { checkDone();/\.catch(err => {/g' src/pages/Home.tsx
