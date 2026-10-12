import { createNavigation } from "next-intl/navigation";
import { routingNoPrefix } from "./routing";

export const { Link, redirect, usePathname, useRouter } =
    createNavigation(routingNoPrefix);