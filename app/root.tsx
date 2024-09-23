import {
  Form,
  NavLink,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useSubmit
} from "@remix-run/react";
import { useEffect } from "react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";

import { createEmptyContact, getContacts } from "./data";

import "./tailwind.css";
import "./app.css"

export const action = async () => {
  const contact = await createEmptyContact();
  return redirect(`/contacts/${contact.id}/edit`);
}

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export const loader = async ({ request }: LoaderFunctionArgs ) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return json({ contacts, q })
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { contacts, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const searching = navigation.location && new URLSearchParams(navigation.location.search).has("q");

  useEffect(() => {
    const searchField = document.getElementById("q");
    if (searchField instanceof HTMLInputElement) {
      searchField.value = q || "";
    }
  }, [q]);

  return (
    <html lang="en" className="h-full" data-theme="cupcake">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <div className="drawer lg:drawer-open">
          <input id="drawer-toggle" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content flex flex-col">
            <div className="navbar bg-base-100">
              <div className="flex-none lg:hidden">
                <label htmlFor="drawer-toggle" aria-label="Open drawer" className="btn btn-square btn-ghost drawer-button lg:hidden">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                </label>
              </div>
              <div className="flex-1 px-2 mx-2">
                <h1 className="text-xl font-bold">Remix Contacts</h1>
              </div>
              <div className="flex-none hidden lg:block">
              </div>
            </div>
            <div className="p-4">
              {children}
            </div>
          </div>
          <div className="drawer-side">
            <label htmlFor="drawer-toggle" className="drawer-overlay"></label>
            <div className="menu p-4 w-80 bg-base-200 text-base-content">
              <div className="mb-4">
                <Form
                  id="search-form"
                  onChange={(event) => {
                    const isFirstSearch = q === null;
                    submit(event.currentTarget, { replace: !isFirstSearch });
                  }}
                  role="search"
                  className="form-control"
                >
                  <input
                    aria-label="Search contacts"
                    className={`input input-bordered ${searching ? "bg-gray-200" : ""}`}
                    defaultValue={q || ""}
                    id="q"
                    name="q"
                    placeholder="Search"
                    type="search"
                  />
                  <div aria-hidden hidden={!searching} id="search-spinner" />
                </Form>
              </div>
              <div className="mb-4">
                <Form method="post">
                  <button type="submit" className="btn btn-primary w-full">New</button>
                </Form>
              </div>
              <nav>
                {contacts.length ? (
                  <ul className="menu">
                    {contacts.map((contact) => (
                      <li key={contact.id}>
                        <NavLink
                          className={({ isActive, isPending }) =>
                            `block p-2 ${
                              isActive
                                ? "bg-primary text-primary-content"
                                : isPending
                                ? "bg-base-300"
                                :""
                            }`
                          }
                          to={`contacts/${contact.id}`}
                         
                        >
                          {contact.first || contact.last ? (
                            <>
                              {contact.first} {contact.last}
                            </>
                          ) : (
                            <i>No Name</i>
                          )}{" "}
                          {contact.favorite ? <span className="ml-4">★</span> : null}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-base-content/70 italic">
                    No contacts
                  </p>
                )}
              </nav>
              <div className="mt-auto">
                <img src="/brand-icon.svg" alt="Brand Icon" className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
