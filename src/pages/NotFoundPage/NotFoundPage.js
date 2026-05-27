import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
    <main className="container py-7">
        <h1>Page not found</h1>
        <Link to="/">Go home</Link>
    </main>
);

export default NotFoundPage;
