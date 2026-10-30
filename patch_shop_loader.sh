sed -i '230c\
            ) : loading ? (\
              <div className="flex justify-center items-center py-20">\
                <Preloader text="Curating Collection..." />\
              </div>\
            ) : (\
              <>' src/pages/Shop.tsx
