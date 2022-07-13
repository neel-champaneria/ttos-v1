import { useRouter } from "next/router";
import Link from "next/link";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchAppConfig, fetchMenuAction } from "./../src/actions/MenuAction";
import { setQrInfoAction } from "./../src/actions/QrActions";
import SearchedItemCompoent from "../src/components/menuComponents/SearchedItemComponent";

import { Carousel, Button, Offcanvas, Navbar, Spinner } from "react-bootstrap";
import SingleItem from "./../src/components/menuComponents/SingleItem";

const Home = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { query } = router;
  let qrInfo = (qrInfo = useSelector((state) => state.QrReducer));

  const [menu, setMenu] = useState([]);
  const [recommendedItems, setRecommendedItems] = useState([]);
  const [restaurantInfo, setRestaurantInfo] = useState({});
  const [restaurantProfile, setResturantProfile] = useState({});
  const [menuRows, setMenuRows] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [allItemsName, setAllItemsName] = useState([]);
  const [searchMatchItem, setSearchMatchItem] = useState([]);
  const [searchMatchItemRow, setSearchMatchItemRow] = useState([]);
  const [showSearchResult, setShowSearchResult] = useState(false);
  const [showSearchbar, setShowSearchbar] = useState(false);

  const [numOfCategory, setNumOfCategory] = useState(null);

  const [isMenuFetchingLoading, setIsMenuFetchingLoading] = useState(false);
  const [isMenuPrepareLoading, setIsMenuPrepareLoading] = useState(false);

  const [allCategoriesObj, setAllCategoriesObj] = useState({});
  const [currentCategory, setCurrentCategory] = useState({});
  const [categoriesArray, setCategoriesArray] = useState([]);

  /* useEffect(() => {
    dispatch(fetchMenuAction());
    if (Object.keys(query).length !== 0) {
      dispatch(
        setQrInfoAction({
          tableId: query.tableId,
          qrId: query.qrId,
          tableName: query.tableName,
        })
      );
    }
  }, [query, qrInfo, dispatch]); */

  useEffect(async () => {
    try {
      if (router.isReady) {
        setIsMenuFetchingLoading(true);
        if (
          Object.keys(router.query).length !== 0 &&
          router.query.tableId &&
          router.query.qrId &&
          router.query.tableName
        ) {
          dispatch(
            setQrInfoAction({
              tableId: query.tableId,
              qrId: query.qrId,
              tableName: query.tableName,
            })
          );
          const menuResponse = await dispatch(
            fetchMenuAction(router.query.qrId)
          );
          const restaurantInfoResposne = await dispatch(
            fetchAppConfig(router.query.qrId)
          );
          console.log("menuResponse: ", menuResponse);
          console.log("restaurantInfoResposne: ", restaurantInfoResposne);
          if (menuResponse.status) {
            setMenu(menuResponse.jsonData.menu);
            setRecommendedItems(
              menuResponse.jsonData?.recommendedItem?.length > 0
                ? menuResponse.jsonData?.recommendedItem
                : []
            );
            setResturantProfile(menuResponse.jsonData.restaurant);
          } else {
            if (menuResponse?.error?.qrExpire) {
              console.log("menu response: qrExpired");
              router.replace("/qr-expired");
            } else {
              console.log("menu response: something-wrong");
              router.replace("/something-wrong");
            }
          }
          if (restaurantInfoResposne.status) {
            setRestaurantInfo(restaurantInfoResposne.jsonData);
          } else {
            if (restaurantInfoResposne?.error?.qrExpire) {
              console.log("restaurant info response: qrExpired");
              router.replace("/qr-expired");
            } else {
              console.log("restaurant info response: something-wrong");
              router.replace("/something-wrong");
            }
          }
          if (menuResponse.status && restaurantInfoResposne.status) {
            setIsMenuFetchingLoading(false);
          }
        } else {
          if (qrInfo && Object.keys(qrInfo).length !== 0 && qrInfo.qrId) {
            const menuResponse = await dispatch(fetchMenuAction(qrInfo.qrId));
            const restaurantInfoResposne = await dispatch(
              fetchAppConfig(qrInfo.qrId)
            );
            console.log("menuResponse: ", menuResponse);
            console.log("restaurantInfoResposne: ", restaurantInfoResposne);
            if (menuResponse.status) {
              setMenu(menuResponse.jsonData.menu);
              setRecommendedItems(
                menuResponse.jsonData?.recommendedItem?.length > 0
                  ? menuResponse.jsonData?.recommendedItem
                  : []
              );
              setResturantProfile(menuResponse.jsonData.restaurant);
            } else {
              if (menuResponse?.error?.qrExpire) {
                console.log("menu response: qrExpired");
                router.replace("/qr-expired");
              } else {
                console.log("menu response: something-wrong");
                router.replace("/something-wrong");
              }
            }
            if (restaurantInfoResposne.status) {
              setRestaurantInfo(restaurantInfoResposne.jsonData);
            } else {
              if (restaurantInfoResposne?.error?.qrExpire) {
                console.log("restaurant info response: qrExpired");
                router.replace("/qr-expired");
              } else {
                console.log("restaurant info response: something-wrong");
                router.replace("/something-wrong");
              }
            }
            if (menuResponse.status && restaurantInfoResposne.status) {
              setIsMenuFetchingLoading(false);
            }
          } else {
            router.replace("./qr-not-found");
          }
        }
      }
    } catch (error) {
      console.log("in catch block: ");
      console.log("error.toJSON(): ", error?.toJSON());
      console.log("error.response: ", error?.response);
      // router.replace("/something-wrong");
    }
  }, [dispatch, router]);

  // const menu = useSelector((state) => state.menuReducer) || [];
  // qrInfo = useSelector((state) => state.QrReducer);
  // const restaurant = useSelector((state) => state.resReducer);

  useEffect(() => {
    if (menu.length > 0) {
      setIsMenuPrepareLoading(true);
      setNumOfCategory(menu.length);
      let clonedMenu = [...menu];
      let rows = [];
      /* for (let i = 0; i < clonedMenu.length; i += 2) {
        rows.push([
          clonedMenu[i],
          i + 1 < clonedMenu.length ? clonedMenu[i + 1] : null,
        ]);
      }
      setMenuRows(rows); */
      const allNames = [];
      for (let i = 0; i < menu.length; i++) {
        for (let j = 0; j < menu[i].items.length; j++) {
          allNames.push(menu[i].items[j].name);
        }
      }
      setAllItemsName(allNames);
      setIsMenuPrepareLoading(false);
    }
  }, [menu]);

  // useEffect for each category creates a 2d array [[{}, {}], [{}, {}], [{}, {}], ...]
  /* useEffect(() => {
    if (menu.length > 0) {
      let clonedMenu = [...menu];
      const tempCategoriesObj = {};
      const tempCategoriesArray = [];
      for (let i = 0; i < clonedMenu.length; i++) {
        const tempItemsRows = [];
        for (let j = 0; j < clonedMenu[i].items.length; j += 2) {
          tempItemsRows.push([
            clonedMenu[i].items[j],
            j + 1 < clonedMenu[i].items.length
              ? clonedMenu[i].items[j + 1]
              : null,
          ]);
        }
        tempCategoriesObj[clonedMenu[i].id] = {
          id: clonedMenu[i].id,
          name: clonedMenu[i].name,
          itemsRows: tempItemsRows,
          isRecommended: false,
        };
        tempCategoriesArray.push({
          id: clonedMenu[i].id,
          name: clonedMenu[i].name,
          image: clonedMenu[i].image,
          isRecommended: false,
        });
      }
      // console.log("tempCategoriesObj: ", tempCategoriesObj);
      setAllCategoriesObj({ ...allCategoriesObj, ...tempCategoriesObj });
      setCategoriesArray([...categoriesArray, ...tempCategoriesArray]);
      setCurrentCategory(tempCategoriesObj[clonedMenu[0].id]);
    }
  }, [menu]); */

  // useEffect for recommendetion items, it create new category names "OUR SIGNATURES".
  /* useEffect(() => {
    if (recommendedItems.length > 0) {
      const tempItemsRows = [];
      const tempCategoriesObj = {};
      for (let i = 0; i < recommendedItems.length; i += 2) {
        tempItemsRows.push([
          recommendedItems[i],
          i + 1 < recommendedItems.length ? recommendedItems[i + 1] : null,
        ]);
      }
      tempCategoriesObj["Recommendations"] = {
        id: "Recommendations",
        name: "OUR SIGNATURES",
        itemsRows: tempItemsRows,
        isRecommended: true,
      };
      setAllCategoriesObj({ ...tempCategoriesObj, ...allCategoriesObj });
      setCategoriesArray([
        {
          id: "Recommendations",
          name: "OUR SIGNATURES",
          isRecommended: true,
          image: "",
        },
        ...categoriesArray,
      ]);
      setCurrentCategory(tempCategoriesObj["Recommendations"]);
    }
  }, [recommendedItems]); */

  useEffect(() => {
    if (menu.length > 0) {
      let clonedMenu = [...menu];
      const tempCategoriesObj = {};
      const tempCategoriesArray = [];
      for (let i = 0; i < clonedMenu.length; i++) {
        tempCategoriesObj[clonedMenu[i].id] = {
          id: clonedMenu[i].id,
          name: clonedMenu[i].name,
          itemsRows: [...clonedMenu[i].items],
          isRecommended: false,
        };
        tempCategoriesArray.push({
          id: clonedMenu[i].id,
          name: clonedMenu[i].name,
          image: clonedMenu[i].image,
          isRecommended: false,
        });
      }
      // console.log("tempCategoriesObj: ", tempCategoriesObj);
      setAllCategoriesObj({ ...allCategoriesObj, ...tempCategoriesObj });
      setCategoriesArray([...categoriesArray, ...tempCategoriesArray]);
      setCurrentCategory(tempCategoriesObj[clonedMenu[0].id]);
    }
  }, [menu]);

  useEffect(() => {
    if (recommendedItems.length > 0) {
      const tempItemsRows = [];
      const tempCategoriesObj = {};
      tempCategoriesObj["Recommendations"] = {
        id: "Recommendations",
        name: "OUR SIGNATURES",
        itemsRows: recommendedItems,
        isRecommended: true,
      };
      setAllCategoriesObj({ ...tempCategoriesObj, ...allCategoriesObj });
      setCategoriesArray([
        {
          id: "Recommendations",
          name: "OUR SIGNATURES",
          isRecommended: true,
          image: "",
        },
        ...categoriesArray,
      ]);
      setCurrentCategory(tempCategoriesObj["Recommendations"]);
    }
  }, [recommendedItems]);

  const onChangeCategory = (categoryId) => {
    setCurrentCategory(allCategoriesObj[categoryId]);
    window.scroll(0, 0);
  };

  const onSearch = () => {
    if (searchText === "") {
      return;
    }
    const pattern = RegExp(searchText, "i");

    const items = [];
    for (let i = 0; i < menu.length; i++) {
      for (let j = 0; j < menu[i].items.length; j++) {
        if (pattern.test(menu[i].items[j].name))
          items.push({ item: menu[i].items[j], category: menu[i] });
      }
    }
    setSearchMatchItem(items);
    const rows = [];
    for (let i = 0; i < items.length; i += 2) {
      rows.push([items[i], i + 1 < items.length ? items[i + 1] : null]);
    }
    setSearchMatchItemRow(rows);
    setShowSearchResult(true);
  };

  useEffect(() => {
    if (searchText === "") {
      setShowSearchResult(false);
    }
  }, [searchText]);

  const clickSearchIcon = () => {
    setShowSearchbar(!showSearchbar);
    setSearchText("");
    setShowSearchResult(false);
  };

  //  const bodyTagScroll = document.getElementsByTagName("body");

  // bodyTagScroll.on("scroll", function (e) {
  //   // if (this.scrollTop > 147) {
  //   //   wrap.addClass("fix-search");
  //   // } else {
  //   //   wrap.removeClass("fix-search");
  //   // }
  //   alert("Body scroll");
  // });

  const [isFixToTopHook, setIsFixToTopHook] = useState(false);
  /* window.onscroll = (e) => {
    setTimeout(() => {
      console.log(window.pageYOffset);
      if (window.pageYOffset > 100) {
        // fix the category list
        setIsFixToTopHook(true);
      } else {
        setIsFixToTopHook(false);
      }
    }, 0);
  }; */
  const handleScroll = () => {
    const position = window.pageYOffset;
    // console.log("position: ", position);
    if (position > 100) {
      setIsFixToTopHook(true);
    } else {
      setIsFixToTopHook(false);
    }
  };
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      {isMenuFetchingLoading ? (
        <>
          <div className="container d-flex flex-column justify-content-center align-items-center vh-100">
            <Spinner animation="border" variant="secondary" />
            <h2>Getting Menu</h2>
          </div>
        </>
      ) : (
        <>
          {isMenuPrepareLoading ? (
            <>
              <div className="container d-flex flex-column justify-content-center align-items-center vh-100">
                <Spinner animation="border" variant="secondary" />
                <h2>Preparing Menu</h2>
              </div>
            </>
          ) : (
            <>
              {/* Table Number */}
              <div className="mb-2">
                <div className="text-center table_strip">
                  TABLE {qrInfo.tableName}
                </div>
              </div>

              {/* Restaurant Logo, Name and Search Button */}
              <div className="container mb-2">
                <div className="header">
                  <Navbar>
                    <Navbar.Brand>
                      {/* <img
                        src="/eatery_logo.png"
                        className="logo-height d-inline-block align-top"
                        alt="React Bootstrap logo"
                      /> */}
                      {restaurantProfile.logo ? (
                        <img
                          src={restaurantProfile.logo}
                          className="logo-height d-inline-block align-top"
                          alt="React Bootstrap logo"
                        />
                      ) : null}
                    </Navbar.Brand>
                    <Navbar.Brand className="header_title">
                      {restaurantProfile.name}
                    </Navbar.Brand>
                    <Navbar.Toggle />
                    <Navbar.Collapse className="justify-content-end">
                      <Navbar.Text>
                        <img
                          src="/search.svg"
                          alt="search icon"
                          onClick={() => {
                            clickSearchIcon();
                          }}
                        />
                      </Navbar.Text>
                    </Navbar.Collapse>
                  </Navbar>
                </div>
              </div>

              {/* Search Bar */}
              {showSearchbar ? (
                <div className="container mb-2 d-flex">
                  <input
                    type="text"
                    className="form-control border-radius-5"
                    placeholder="Search"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                  <button
                    onClick={() => onSearch()}
                    className="btn red-btn search-btn"
                  >
                    Search
                  </button>
                </div>
              ) : null}

              {menu &&
                numOfCategory &&
                !showSearchResult &&
                allCategoriesObj &&
                categoriesArray && (
                  <div>
                    <div
                      className={`category-list-container d-flex pb-2 mb-2 ${
                        isFixToTopHook ? " fix-to-top" : " scroll-content"
                      }`}
                    >
                      {/* ${isFixToTopHook ? " fix-to-top" : "scroll-content"} */}
                      {categoriesArray.map((category, idx) => {
                        return (
                          <div
                            key={category.id}
                            className={`individual-category d-inline-block ${
                              category.id === currentCategory.id
                                ? " is-selected"
                                : null
                            }`}
                            onClick={() => {
                              onChangeCategory(category.id);
                            }}
                          >
                            <div className="category-list-data-wrapper">
                              <div className="category-img-container">
                                <img
                                  className="d-block img-fluid cover-img"
                                  src={
                                    !category.isRecommended
                                      ? category.image
                                        ? category.image
                                        : "/item-placeholder-square.png"
                                      : "/recommendation.png"
                                  }
                                  alt="Image"
                                />
                              </div>

                              <h2 className="text-center color-white pt-1 pb-0 text-uppercase fw-bold">
                                {category.name}
                              </h2>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <h2 className="pt-2 pb-2 pb-0 text-uppercase text-center font-semi-bold">
                      {currentCategory.name}
                    </h2>

                    {/* <div className="container fix-height category-item-container">
                      {currentCategory &&
                        currentCategory?.itemsRows?.map((row, idx) => {
                          return (
                            <div
                              className="row justify-content-md-center pb-2 mb-5"
                              key={idx}
                            >
                              {row[0] && (
                                <div className="col-6" key={row[0].id}>
                                  <SingleItem
                                    category={
                                      currentCategory.isRecommended
                                        ? row[0].categoryName
                                        : currentCategory.name
                                    }
                                    item={row[0]}
                                  />
                                </div>
                              )}
                              {row[1] ? (
                                <div className="col-6" key={row[1].id}>
                                  <SingleItem
                                    category={
                                      currentCategory.isRecommended
                                        ? row[0].categoryName
                                        : currentCategory.name
                                    }
                                    item={row[1]}
                                  />
                                </div>
                              ) : (
                                <div className="col-6"></div>
                              )}
                            </div>
                          );
                        })}
                    </div> */}

                    <div className="container fix-height category-item-container">
                      <div className="row justify-content-md-center pb-2 mb-5">
                        {currentCategory &&
                          currentCategory?.itemsRows?.map((item, idx) => {
                            return (
                              <div className="col-6" key={item.id}>
                                <SingleItem
                                  category={
                                    currentCategory.isRecommended
                                      ? item.categoryName
                                      : currentCategory.name
                                  }
                                  item={item}
                                />
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                )}

              {/* 
          Search Component
          This loads when search keyword is entered in serach bar and search button is pressed.
          If search keyword matches any item name then SearchedItemCompoent will load,
          otherwise it will show "No items found" and button to see all categories.
      */}

              {showSearchResult && (
                <>
                  {searchMatchItem.length > 0 ? (
                    <>
                      <SearchedItemCompoent
                        searchMatchItemRow={searchMatchItemRow}
                      />
                    </>
                  ) : (
                    <>
                      <div className="container text-center mt-5">
                        <h2 className="">No items found</h2>
                        <Button
                          className="red-btn"
                          variant="danger"
                          onClick={() => clickSearchIcon()}
                        >
                          See All Category
                        </Button>
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
};

export default Home;
