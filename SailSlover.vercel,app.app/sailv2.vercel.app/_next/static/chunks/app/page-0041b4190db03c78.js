(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
    [931], {
        1390: (e, t, s) => {
            Promise.resolve().then(s.bind(s, 5979))
        },
        5979: (e, t, s) => {
            "use strict";
            s.r(t), s.d(t, {
                default: () => h
            });
            var n = s(7437),
                a = s(7449),
                r = s.n(a),
                o = s(6463),
                l = s(2265),
                d = s(9196),
                i = s(8472),
                u = s(2558),
                c = s.n(u);
            async function p(e) {
                let t = new(c());
                t.append("roll_number", e), i.Z.request({
                    method: "post",
                    maxBodyLength: 1 / 0,
                    url: "https://dbchangesstudent.edwisely.com/auth/getLoginOtp",
                    headers: {
                        Accept: "application/json, text/plain, */*",
                        Referer: "https://sailstudent.sairamit.edu.in/",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                        "sec-ch-ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-platform": '"Windows"',
                        "Content-Type": "multipart/form-data"
                    },
                    data: t
                }).then(e => 200 == e.data.status ? e.data.otp_send_to : -1).catch(e => {})
            }

            function h() {
                let e = (0, o.useRouter)(),
                    [t, s] = (0, l.useState)(!1),
                    [a, i] = (0, l.useState)(!1),
                    [u, c] = (0, l.useState)(!1),
                    h = e => {
                        i("otp" === e), "otp" === e && p("".concat(document.getElementById("username").value)), c(!0)
                    };
                return (0, n.jsxs)(n.Fragment, {
                    children: [(0, n.jsxs)(r(), {
                        children: [(0, n.jsx)("title", {
                            children: "SAIL"
                        }), (0, n.jsx)("link", {
                            rel: "preconnect",
                            href: "https://fonts.gstatic.com"
                        }), (0, n.jsx)("link", {
                            href: "https://fonts.googleapis.com/css2?family=Poppins:wght@300;500;600&display=swap",
                            rel: "stylesheet"
                        })]
                    }), (0, n.jsx)("script", {
                        async: !0,
                        src: "https://www.googletagmanager.com/gtag/js?id=G-F7WR3HX216"
                    }), (0, n.jsx)("script", {
                        children: "\n                window.dataLayer = window.dataLayer || [];\n                function gtag(){dataLayer.push(arguments);}\n                gtag('js', new Date());\n                \n                gtag('config', 'G-F7WR3HX216');\n                "
                    }), t ? (0, n.jsx)(d.default, {}) : (0, n.jsxs)("div", {
                        className: "background",
                        children: [(0, n.jsxs)("div", {
                            children: [(0, n.jsx)("div", {
                                className: "shape"
                            }), (0, n.jsx)("div", {
                                className: "shape"
                            })]
                        }), (0, n.jsxs)("form", {
                            onSubmit: function(t) {
                                t.preventDefault(), s(!0), fetch("/authenticate", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json"
                                    },
                                    body: JSON.stringify({
                                        user: document.getElementById("username").value,
                                        password: a ? document.getElementById("otp").value : document.getElementById("password").value,
                                        useOtp: a
                                    })
                                }).then(e => e.json()).then(t => {
                                    s(!1), t.success ? (sessionStorage.setItem("token", t.token), e.push("/dashboard")) : alert("Invalid credentials")
                                }).catch(e => {
                                    s(!1), alert("An error occurred. Please try again.")
                                })
                            },
                            children: [(0, n.jsx)("h3", {
                                children: "SAIL Login"
                            }), (0, n.jsx)("label", {
                                htmlFor: "username",
                                children: "Username"
                            }), (0, n.jsx)("input", {
                                type: "text",
                                placeholder: "SEC ID",
                                id: "username",
                                name: "user",
                                required: !0
                            }), u ? a ? (0, n.jsxs)(n.Fragment, {
                                children: [(0, n.jsx)("label", {
                                    htmlFor: "otp",
                                    children: "OTP"
                                }), (0, n.jsx)("input", {
                                    type: "text",
                                    placeholder: "Enter OTP",
                                    id: "otp",
                                    name: "otp",
                                    required: !0
                                })]
                            }) : (0, n.jsxs)(n.Fragment, {
                                children: [(0, n.jsx)("label", {
                                    htmlFor: "password",
                                    children: "Password"
                                }), (0, n.jsx)("input", {
                                    type: "text",
                                    placeholder: "Password",
                                    id: "password",
                                    name: "password",
                                    required: !0
                                })]
                            }) : (0, n.jsxs)(n.Fragment, {
                                children: [(0, n.jsx)("button", {
                                    type: "button",
                                    onClick: () => h("otp"),
                                    children: "Log in using OTP"
                                }), (0, n.jsx)("button", {
                                    type: "button",
                                    onClick: () => h("password"),
                                    children: "Log in using Password"
                                })]
                            }), u && (0, n.jsx)("button", {
                                type: "submit",
                                id: "sendData",
                                children: "Log In"
                            })]
                        })]
                    })]
                })
            }
            s(3684)
        },
        2558: e => {
            e.exports = "object" == typeof self ? self.FormData : window.FormData
        },
        7449: (e, t) => {
            "use strict";

            function s() {
                return null
            }
            Object.defineProperty(t, "__esModule", {
                value: !0
            }), Object.defineProperty(t, "default", {
                enumerable: !0,
                get: function() {
                    return s
                }
            }), ("function" == typeof t.default || "object" == typeof t.default && null !== t.default) && void 0 === t.default.__esModule && (Object.defineProperty(t.default, "__esModule", {
                value: !0
            }), Object.assign(t.default, t), e.exports = t.default)
        },
        3684: () => {}
    },
    e => {
        var t = t => e(e.s = t);
        e.O(0, [149, 236, 300, 130, 215, 744], () => t(1390)), _N_E = e.O()
    }
]);