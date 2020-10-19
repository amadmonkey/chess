import Login from "../components/Login/Login";
import Home from "../components/Home/Home";
import NotFound from "../components/NotFound/NotFound";

class Route {
    constructor({ label = "", path = "", component = "", exact = true}) {
        this.label = label;
        this.path = path;
        this.component = component;
        this.exact = exact;
    }
}

const ROUTES = {
    login: new Route({
        label: "Login",
        path: "/",
        component: Login,
        exact: true,
    }),
    home: new Route({
        label: "Home",
        path: "/:roomId",
        component: Home,
        exact: false,
    }),
    notFound: new Route({
        label: "404",
        path: "/404",
        component: NotFound,
        exact: true,
    })
}

export default ROUTES;
