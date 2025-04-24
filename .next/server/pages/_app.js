/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./components/Header.js":
/*!******************************!*\
  !*** ./components/Header.js ***!
  \******************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ Header)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/link */ \"./node_modules/next/link.js\");\n/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_link__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var firebase_auth__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! firebase/auth */ \"firebase/auth\");\n/* harmony import */ var _firebase__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../firebase */ \"./firebase.js\");\n/* harmony import */ var firebase_firestore__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! firebase/firestore */ \"firebase/firestore\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([firebase_auth__WEBPACK_IMPORTED_MODULE_3__, _firebase__WEBPACK_IMPORTED_MODULE_4__, firebase_firestore__WEBPACK_IMPORTED_MODULE_5__]);\n([firebase_auth__WEBPACK_IMPORTED_MODULE_3__, _firebase__WEBPACK_IMPORTED_MODULE_4__, firebase_firestore__WEBPACK_IMPORTED_MODULE_5__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);\n// components/Header.js\n\n\n\n\n\n\nfunction Header() {\n    const [user, setUser] = (0,react__WEBPACK_IMPORTED_MODULE_2__.useState)(null);\n    const [name, setName] = (0,react__WEBPACK_IMPORTED_MODULE_2__.useState)(\"\");\n    (0,react__WEBPACK_IMPORTED_MODULE_2__.useEffect)(()=>{\n        const unsubscribe = (0,firebase_auth__WEBPACK_IMPORTED_MODULE_3__.onAuthStateChanged)(_firebase__WEBPACK_IMPORTED_MODULE_4__.auth, async (currentUser)=>{\n            setUser(currentUser);\n            if (currentUser) {\n                const docRef = (0,firebase_firestore__WEBPACK_IMPORTED_MODULE_5__.doc)(_firebase__WEBPACK_IMPORTED_MODULE_4__.db, \"users\", currentUser.uid);\n                const docSnap = await (0,firebase_firestore__WEBPACK_IMPORTED_MODULE_5__.getDoc)(docRef);\n                if (docSnap.exists()) {\n                    setName(docSnap.data().name);\n                }\n            } else {\n                setName(\"\");\n            }\n        });\n        return ()=>unsubscribe();\n    }, []);\n    const handleLogout = async ()=>{\n        try {\n            await (0,firebase_auth__WEBPACK_IMPORTED_MODULE_3__.signOut)(_firebase__WEBPACK_IMPORTED_MODULE_4__.auth);\n        } catch (error) {\n            console.error(\"\\xc7ıkış Hatası:\", error.message);\n        }\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"header\", {\n        style: {\n            padding: \"1rem\",\n            borderBottom: \"1px solid #ccc\"\n        },\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"nav\", {\n            style: {\n                display: \"flex\",\n                justifyContent: \"space-between\",\n                alignItems: \"center\"\n            },\n            children: [\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                    style: {\n                        display: \"flex\",\n                        gap: \"1rem\"\n                    },\n                    children: [\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_link__WEBPACK_IMPORTED_MODULE_1___default()), {\n                            href: \"/\",\n                            children: \"Ana Sayfa\"\n                        }, void 0, false, {\n                            fileName: \"C:\\\\Users\\\\SALCI\\\\Downloads\\\\yolcuberaberi\\\\components\\\\Header.js\",\n                            lineNumber: 42,\n                            columnNumber: 11\n                        }, this),\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_link__WEBPACK_IMPORTED_MODULE_1___default()), {\n                            href: \"/talep\",\n                            children: \"Talep Oluştur\"\n                        }, void 0, false, {\n                            fileName: \"C:\\\\Users\\\\SALCI\\\\Downloads\\\\yolcuberaberi\\\\components\\\\Header.js\",\n                            lineNumber: 43,\n                            columnNumber: 11\n                        }, this),\n                        /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_link__WEBPACK_IMPORTED_MODULE_1___default()), {\n                            href: \"/talepler\",\n                            children: \"T\\xfcm Talepler\"\n                        }, void 0, false, {\n                            fileName: \"C:\\\\Users\\\\SALCI\\\\Downloads\\\\yolcuberaberi\\\\components\\\\Header.js\",\n                            lineNumber: 44,\n                            columnNumber: 1\n                        }, this),\n                        user ? /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {\n                            children: [\n                                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_link__WEBPACK_IMPORTED_MODULE_1___default()), {\n                                    href: \"/profile\",\n                                    children: \"Profil\"\n                                }, void 0, false, {\n                                    fileName: \"C:\\\\Users\\\\SALCI\\\\Downloads\\\\yolcuberaberi\\\\components\\\\Header.js\",\n                                    lineNumber: 48,\n                                    columnNumber: 15\n                                }, this),\n                                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                                    onClick: handleLogout,\n                                    style: {\n                                        background: \"red\",\n                                        color: \"white\"\n                                    },\n                                    children: \"\\xc7ıkış Yap\"\n                                }, void 0, false, {\n                                    fileName: \"C:\\\\Users\\\\SALCI\\\\Downloads\\\\yolcuberaberi\\\\components\\\\Header.js\",\n                                    lineNumber: 49,\n                                    columnNumber: 15\n                                }, this)\n                            ]\n                        }, void 0, true) : /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {\n                            children: [\n                                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_link__WEBPACK_IMPORTED_MODULE_1___default()), {\n                                    href: \"/login\",\n                                    children: \"Giriş\"\n                                }, void 0, false, {\n                                    fileName: \"C:\\\\Users\\\\SALCI\\\\Downloads\\\\yolcuberaberi\\\\components\\\\Header.js\",\n                                    lineNumber: 55,\n                                    columnNumber: 15\n                                }, this),\n                                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_link__WEBPACK_IMPORTED_MODULE_1___default()), {\n                                    href: \"/register\",\n                                    children: \"Kayıt\"\n                                }, void 0, false, {\n                                    fileName: \"C:\\\\Users\\\\SALCI\\\\Downloads\\\\yolcuberaberi\\\\components\\\\Header.js\",\n                                    lineNumber: 56,\n                                    columnNumber: 15\n                                }, this)\n                            ]\n                        }, void 0, true)\n                    ]\n                }, void 0, true, {\n                    fileName: \"C:\\\\Users\\\\SALCI\\\\Downloads\\\\yolcuberaberi\\\\components\\\\Header.js\",\n                    lineNumber: 41,\n                    columnNumber: 9\n                }, this),\n                user && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                    children: [\n                        \"\\uD83D\\uDC4B Merhaba, \",\n                        name || user.email\n                    ]\n                }, void 0, true, {\n                    fileName: \"C:\\\\Users\\\\SALCI\\\\Downloads\\\\yolcuberaberi\\\\components\\\\Header.js\",\n                    lineNumber: 60,\n                    columnNumber: 18\n                }, this)\n            ]\n        }, void 0, true, {\n            fileName: \"C:\\\\Users\\\\SALCI\\\\Downloads\\\\yolcuberaberi\\\\components\\\\Header.js\",\n            lineNumber: 40,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\SALCI\\\\Downloads\\\\yolcuberaberi\\\\components\\\\Header.js\",\n        lineNumber: 39,\n        columnNumber: 5\n    }, this);\n}\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9jb21wb25lbnRzL0hlYWRlci5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsdUJBQXVCOztBQUNNO0FBQ2U7QUFDZ0I7QUFDckI7QUFDVTtBQUVsQyxTQUFTUztJQUN0QixNQUFNLENBQUNDLE1BQU1DLFFBQVEsR0FBR1QsK0NBQVFBLENBQUM7SUFDakMsTUFBTSxDQUFDVSxNQUFNQyxRQUFRLEdBQUdYLCtDQUFRQSxDQUFDO0lBRWpDRCxnREFBU0EsQ0FBQztRQUNSLE1BQU1hLGNBQWNYLGlFQUFrQkEsQ0FBQ0UsMkNBQUlBLEVBQUUsT0FBT1U7WUFDbERKLFFBQVFJO1lBRVIsSUFBSUEsYUFBYTtnQkFDZixNQUFNQyxTQUFTVCx1REFBR0EsQ0FBQ0QseUNBQUVBLEVBQUUsU0FBU1MsWUFBWUUsR0FBRztnQkFDL0MsTUFBTUMsVUFBVSxNQUFNViwwREFBTUEsQ0FBQ1E7Z0JBQzdCLElBQUlFLFFBQVFDLE1BQU0sSUFBSTtvQkFDcEJOLFFBQVFLLFFBQVFFLElBQUksR0FBR1IsSUFBSTtnQkFDN0I7WUFDRixPQUFPO2dCQUNMQyxRQUFRO1lBQ1Y7UUFDRjtRQUVBLE9BQU8sSUFBTUM7SUFDZixHQUFHLEVBQUU7SUFFTCxNQUFNTyxlQUFlO1FBQ25CLElBQUk7WUFDRixNQUFNakIsc0RBQU9BLENBQUNDLDJDQUFJQTtRQUNwQixFQUFFLE9BQU9pQixPQUFPO1lBQ2RDLFFBQVFELEtBQUssQ0FBQyxvQkFBaUJBLE1BQU1FLE9BQU87UUFDOUM7SUFDRjtJQUVBLHFCQUNFLDhEQUFDQztRQUFPQyxPQUFPO1lBQUVDLFNBQVM7WUFBUUMsY0FBYztRQUFpQjtrQkFDL0QsNEVBQUNDO1lBQUlILE9BQU87Z0JBQUVJLFNBQVM7Z0JBQVFDLGdCQUFnQjtnQkFBaUJDLFlBQVk7WUFBUzs7OEJBQ25GLDhEQUFDQztvQkFBSVAsT0FBTzt3QkFBRUksU0FBUzt3QkFBUUksS0FBSztvQkFBTzs7c0NBQ3pDLDhEQUFDbEMsa0RBQUlBOzRCQUFDbUMsTUFBSztzQ0FBSTs7Ozs7O3NDQUNmLDhEQUFDbkMsa0RBQUlBOzRCQUFDbUMsTUFBSztzQ0FBUzs7Ozs7O3NDQUM5Qiw4REFBQ25DLGtEQUFJQTs0QkFBQ21DLE1BQUs7c0NBQVk7Ozs7Ozt3QkFFWnpCLHFCQUNDOzs4Q0FDRSw4REFBQ1Ysa0RBQUlBO29DQUFDbUMsTUFBSzs4Q0FBVzs7Ozs7OzhDQUN0Qiw4REFBQ0M7b0NBQU9DLFNBQVNoQjtvQ0FBY0ssT0FBTzt3Q0FBRVksWUFBWTt3Q0FBT0MsT0FBTztvQ0FBUTs4Q0FBRzs7Ozs7Ozt5REFLL0U7OzhDQUNFLDhEQUFDdkMsa0RBQUlBO29DQUFDbUMsTUFBSzs4Q0FBUzs7Ozs7OzhDQUNwQiw4REFBQ25DLGtEQUFJQTtvQ0FBQ21DLE1BQUs7OENBQVk7Ozs7Ozs7Ozs7Ozs7O2dCQUk1QnpCLHNCQUFRLDhEQUFDOEI7O3dCQUFLO3dCQUFhNUIsUUFBUUYsS0FBSytCLEtBQUs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUl0RCIsInNvdXJjZXMiOlsid2VicGFjazovL3lvbGN1YmVyYWJlcmkvLi9jb21wb25lbnRzL0hlYWRlci5qcz80ZGJiIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIGNvbXBvbmVudHMvSGVhZGVyLmpzXHJcbmltcG9ydCBMaW5rIGZyb20gXCJuZXh0L2xpbmtcIjtcclxuaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xyXG5pbXBvcnQgeyBvbkF1dGhTdGF0ZUNoYW5nZWQsIHNpZ25PdXQgfSBmcm9tIFwiZmlyZWJhc2UvYXV0aFwiO1xyXG5pbXBvcnQgeyBhdXRoLCBkYiB9IGZyb20gXCIuLi9maXJlYmFzZVwiO1xyXG5pbXBvcnQgeyBkb2MsIGdldERvYyB9IGZyb20gXCJmaXJlYmFzZS9maXJlc3RvcmVcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEhlYWRlcigpIHtcclxuICBjb25zdCBbdXNlciwgc2V0VXNlcl0gPSB1c2VTdGF0ZShudWxsKTtcclxuICBjb25zdCBbbmFtZSwgc2V0TmFtZV0gPSB1c2VTdGF0ZShcIlwiKTtcclxuXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGNvbnN0IHVuc3Vic2NyaWJlID0gb25BdXRoU3RhdGVDaGFuZ2VkKGF1dGgsIGFzeW5jIChjdXJyZW50VXNlcikgPT4ge1xyXG4gICAgICBzZXRVc2VyKGN1cnJlbnRVc2VyKTtcclxuXHJcbiAgICAgIGlmIChjdXJyZW50VXNlcikge1xyXG4gICAgICAgIGNvbnN0IGRvY1JlZiA9IGRvYyhkYiwgXCJ1c2Vyc1wiLCBjdXJyZW50VXNlci51aWQpO1xyXG4gICAgICAgIGNvbnN0IGRvY1NuYXAgPSBhd2FpdCBnZXREb2MoZG9jUmVmKTtcclxuICAgICAgICBpZiAoZG9jU25hcC5leGlzdHMoKSkge1xyXG4gICAgICAgICAgc2V0TmFtZShkb2NTbmFwLmRhdGEoKS5uYW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc2V0TmFtZShcIlwiKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuICgpID0+IHVuc3Vic2NyaWJlKCk7XHJcbiAgfSwgW10pO1xyXG5cclxuICBjb25zdCBoYW5kbGVMb2dvdXQgPSBhc3luYyAoKSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBhd2FpdCBzaWduT3V0KGF1dGgpO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIsOHxLFrxLHFnyBIYXRhc8SxOlwiLCBlcnJvci5tZXNzYWdlKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICByZXR1cm4gKFxyXG4gICAgPGhlYWRlciBzdHlsZT17eyBwYWRkaW5nOiBcIjFyZW1cIiwgYm9yZGVyQm90dG9tOiBcIjFweCBzb2xpZCAjY2NjXCIgfX0+XHJcbiAgICAgIDxuYXYgc3R5bGU9e3sgZGlzcGxheTogXCJmbGV4XCIsIGp1c3RpZnlDb250ZW50OiBcInNwYWNlLWJldHdlZW5cIiwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiB9fT5cclxuICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6IFwiZmxleFwiLCBnYXA6IFwiMXJlbVwiIH19PlxyXG4gICAgICAgICAgPExpbmsgaHJlZj1cIi9cIj5BbmEgU2F5ZmE8L0xpbms+XHJcbiAgICAgICAgICA8TGluayBocmVmPVwiL3RhbGVwXCI+VGFsZXAgT2x1xZ90dXI8L0xpbms+XHJcbjxMaW5rIGhyZWY9XCIvdGFsZXBsZXJcIj5Uw7xtIFRhbGVwbGVyPC9MaW5rPlxyXG5cclxuICAgICAgICAgIHt1c2VyID8gKFxyXG4gICAgICAgICAgICA8PlxyXG4gICAgICAgICAgICAgIDxMaW5rIGhyZWY9XCIvcHJvZmlsZVwiPlByb2ZpbDwvTGluaz5cclxuICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e2hhbmRsZUxvZ291dH0gc3R5bGU9e3sgYmFja2dyb3VuZDogXCJyZWRcIiwgY29sb3I6IFwid2hpdGVcIiB9fT5cclxuICAgICAgICAgICAgICAgIMOHxLFrxLHFnyBZYXBcclxuICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgPC8+XHJcbiAgICAgICAgICApIDogKFxyXG4gICAgICAgICAgICA8PlxyXG4gICAgICAgICAgICAgIDxMaW5rIGhyZWY9XCIvbG9naW5cIj5HaXJpxZ88L0xpbms+XHJcbiAgICAgICAgICAgICAgPExpbmsgaHJlZj1cIi9yZWdpc3RlclwiPkthecSxdDwvTGluaz5cclxuICAgICAgICAgICAgPC8+XHJcbiAgICAgICAgICApfVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIHt1c2VyICYmIDxzcGFuPvCfkYsgTWVyaGFiYSwge25hbWUgfHwgdXNlci5lbWFpbH08L3NwYW4+fVxyXG4gICAgICA8L25hdj5cclxuICAgIDwvaGVhZGVyPlxyXG4gICk7XHJcbn1cclxuIl0sIm5hbWVzIjpbIkxpbmsiLCJ1c2VFZmZlY3QiLCJ1c2VTdGF0ZSIsIm9uQXV0aFN0YXRlQ2hhbmdlZCIsInNpZ25PdXQiLCJhdXRoIiwiZGIiLCJkb2MiLCJnZXREb2MiLCJIZWFkZXIiLCJ1c2VyIiwic2V0VXNlciIsIm5hbWUiLCJzZXROYW1lIiwidW5zdWJzY3JpYmUiLCJjdXJyZW50VXNlciIsImRvY1JlZiIsInVpZCIsImRvY1NuYXAiLCJleGlzdHMiLCJkYXRhIiwiaGFuZGxlTG9nb3V0IiwiZXJyb3IiLCJjb25zb2xlIiwibWVzc2FnZSIsImhlYWRlciIsInN0eWxlIiwicGFkZGluZyIsImJvcmRlckJvdHRvbSIsIm5hdiIsImRpc3BsYXkiLCJqdXN0aWZ5Q29udGVudCIsImFsaWduSXRlbXMiLCJkaXYiLCJnYXAiLCJocmVmIiwiYnV0dG9uIiwib25DbGljayIsImJhY2tncm91bmQiLCJjb2xvciIsInNwYW4iLCJlbWFpbCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./components/Header.js\n");

/***/ }),

/***/ "./firebase.js":
/*!*********************!*\
  !*** ./firebase.js ***!
  \*********************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   auth: () => (/* binding */ auth),\n/* harmony export */   db: () => (/* binding */ db)\n/* harmony export */ });\n/* harmony import */ var firebase_app__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! firebase/app */ \"firebase/app\");\n/* harmony import */ var firebase_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! firebase/auth */ \"firebase/auth\");\n/* harmony import */ var firebase_firestore__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! firebase/firestore */ \"firebase/firestore\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([firebase_app__WEBPACK_IMPORTED_MODULE_0__, firebase_auth__WEBPACK_IMPORTED_MODULE_1__, firebase_firestore__WEBPACK_IMPORTED_MODULE_2__]);\n([firebase_app__WEBPACK_IMPORTED_MODULE_0__, firebase_auth__WEBPACK_IMPORTED_MODULE_1__, firebase_firestore__WEBPACK_IMPORTED_MODULE_2__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);\n// firebase.js\n\n\n\nconst firebaseConfig = {\n    apiKey: \"AIzaSyCk0Ib2BGW6wLEzYM9z5Ry6j7HdSNugP7c\",\n    authDomain: \"yolcuberaberi-9e3c7.firebaseapp.com\",\n    projectId: \"yolcuberaberi-9e3c7\",\n    storageBucket: \"yolcuberaberi-9e3c7.appspot.com\",\n    messagingSenderId: \"877346669639\",\n    appId: \"1:877346669639:web:4a91efc0cd7407defb5d62\"\n};\nconst app = (0,firebase_app__WEBPACK_IMPORTED_MODULE_0__.initializeApp)(firebaseConfig);\nconst auth = (0,firebase_auth__WEBPACK_IMPORTED_MODULE_1__.getAuth)(app);\nconst db = (0,firebase_firestore__WEBPACK_IMPORTED_MODULE_2__.getFirestore)(app);\n\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9maXJlYmFzZS5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLGNBQWM7QUFDK0I7QUFDTDtBQUNVO0FBRWxELE1BQU1HLGlCQUFpQjtJQUNyQkMsUUFBUTtJQUNSQyxZQUFZO0lBQ1pDLFdBQVc7SUFDWEMsZUFBZTtJQUNmQyxtQkFBbUI7SUFDbkJDLE9BQU87QUFDVDtBQUVBLE1BQU1DLE1BQU1WLDJEQUFhQSxDQUFDRztBQUMxQixNQUFNUSxPQUFPVixzREFBT0EsQ0FBQ1M7QUFDckIsTUFBTUUsS0FBS1YsZ0VBQVlBLENBQUNRO0FBRUoiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly95b2xjdWJlcmFiZXJpLy4vZmlyZWJhc2UuanM/NGQ5NyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBmaXJlYmFzZS5qc1xyXG5pbXBvcnQgeyBpbml0aWFsaXplQXBwIH0gZnJvbSBcImZpcmViYXNlL2FwcFwiO1xyXG5pbXBvcnQgeyBnZXRBdXRoIH0gZnJvbSBcImZpcmViYXNlL2F1dGhcIjtcclxuaW1wb3J0IHsgZ2V0RmlyZXN0b3JlIH0gZnJvbSBcImZpcmViYXNlL2ZpcmVzdG9yZVwiO1xyXG5cclxuY29uc3QgZmlyZWJhc2VDb25maWcgPSB7XHJcbiAgYXBpS2V5OiBcIkFJemFTeUNrMEliMkJHVzZ3TEV6WU05ejVSeTZqN0hkU051Z1A3Y1wiLFxyXG4gIGF1dGhEb21haW46IFwieW9sY3ViZXJhYmVyaS05ZTNjNy5maXJlYmFzZWFwcC5jb21cIixcclxuICBwcm9qZWN0SWQ6IFwieW9sY3ViZXJhYmVyaS05ZTNjN1wiLFxyXG4gIHN0b3JhZ2VCdWNrZXQ6IFwieW9sY3ViZXJhYmVyaS05ZTNjNy5hcHBzcG90LmNvbVwiLCAvLyDinIUgZMO8emVsdGlsZGlcclxuICBtZXNzYWdpbmdTZW5kZXJJZDogXCI4NzczNDY2Njk2MzlcIixcclxuICBhcHBJZDogXCIxOjg3NzM0NjY2OTYzOTp3ZWI6NGE5MWVmYzBjZDc0MDdkZWZiNWQ2MlwiXHJcbn07XHJcblxyXG5jb25zdCBhcHAgPSBpbml0aWFsaXplQXBwKGZpcmViYXNlQ29uZmlnKTtcclxuY29uc3QgYXV0aCA9IGdldEF1dGgoYXBwKTtcclxuY29uc3QgZGIgPSBnZXRGaXJlc3RvcmUoYXBwKTsgXHJcblxyXG5leHBvcnQgeyBhdXRoLCBkYiB9O1xyXG4iXSwibmFtZXMiOlsiaW5pdGlhbGl6ZUFwcCIsImdldEF1dGgiLCJnZXRGaXJlc3RvcmUiLCJmaXJlYmFzZUNvbmZpZyIsImFwaUtleSIsImF1dGhEb21haW4iLCJwcm9qZWN0SWQiLCJzdG9yYWdlQnVja2V0IiwibWVzc2FnaW5nU2VuZGVySWQiLCJhcHBJZCIsImFwcCIsImF1dGgiLCJkYiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./firebase.js\n");

/***/ }),

/***/ "./pages/_app.js":
/*!***********************!*\
  !*** ./pages/_app.js ***!
  \***********************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../styles/globals.css */ \"./styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _components_Header__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/Header */ \"./components/Header.js\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_components_Header__WEBPACK_IMPORTED_MODULE_2__]);\n_components_Header__WEBPACK_IMPORTED_MODULE_2__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n// pages/_app.js\n\n\n\nfunction MyApp({ Component, pageProps }) {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_Header__WEBPACK_IMPORTED_MODULE_2__[\"default\"], {}, void 0, false, {\n                fileName: \"C:\\\\Users\\\\SALCI\\\\Downloads\\\\yolcuberaberi\\\\pages\\\\_app.js\",\n                lineNumber: 8,\n                columnNumber: 7\n            }, this),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n                ...pageProps\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\SALCI\\\\Downloads\\\\yolcuberaberi\\\\pages\\\\_app.js\",\n                lineNumber: 9,\n                columnNumber: 7\n            }, this)\n        ]\n    }, void 0, true);\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MyApp);\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9fYXBwLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLGdCQUFnQjs7QUFDZTtBQUNXO0FBRTFDLFNBQVNDLE1BQU0sRUFBRUMsU0FBUyxFQUFFQyxTQUFTLEVBQUU7SUFDckMscUJBQ0U7OzBCQUNFLDhEQUFDSCwwREFBTUE7Ozs7OzBCQUNQLDhEQUFDRTtnQkFBVyxHQUFHQyxTQUFTOzs7Ozs7OztBQUc5QjtBQUVBLGlFQUFlRixLQUFLQSxFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8veW9sY3ViZXJhYmVyaS8uL3BhZ2VzL19hcHAuanM/ZTBhZCJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBwYWdlcy9fYXBwLmpzXHJcbmltcG9ydCBcIi4uL3N0eWxlcy9nbG9iYWxzLmNzc1wiO1xyXG5pbXBvcnQgSGVhZGVyIGZyb20gXCIuLi9jb21wb25lbnRzL0hlYWRlclwiO1xyXG5cclxuZnVuY3Rpb24gTXlBcHAoeyBDb21wb25lbnQsIHBhZ2VQcm9wcyB9KSB7XHJcbiAgcmV0dXJuIChcclxuICAgIDw+XHJcbiAgICAgIDxIZWFkZXIgLz5cclxuICAgICAgPENvbXBvbmVudCB7Li4ucGFnZVByb3BzfSAvPlxyXG4gICAgPC8+XHJcbiAgKTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgTXlBcHA7XHJcbiJdLCJuYW1lcyI6WyJIZWFkZXIiLCJNeUFwcCIsIkNvbXBvbmVudCIsInBhZ2VQcm9wcyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./pages/_app.js\n");

/***/ }),

/***/ "./styles/globals.css":
/*!****************************!*\
  !*** ./styles/globals.css ***!
  \****************************/
/***/ (() => {



/***/ }),

/***/ "next/dist/compiled/next-server/pages.runtime.dev.js":
/*!**********************************************************************!*\
  !*** external "next/dist/compiled/next-server/pages.runtime.dev.js" ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/pages.runtime.dev.js");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "firebase/app":
/*!*******************************!*\
  !*** external "firebase/app" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = import("firebase/app");;

/***/ }),

/***/ "firebase/auth":
/*!********************************!*\
  !*** external "firebase/auth" ***!
  \********************************/
/***/ ((module) => {

"use strict";
module.exports = import("firebase/auth");;

/***/ }),

/***/ "firebase/firestore":
/*!*************************************!*\
  !*** external "firebase/firestore" ***!
  \*************************************/
/***/ ((module) => {

"use strict";
module.exports = import("firebase/firestore");;

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@swc"], () => (__webpack_exec__("./pages/_app.js")));
module.exports = __webpack_exports__;

})();