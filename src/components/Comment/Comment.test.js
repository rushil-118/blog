import { render, screen } from '@testing-library/react';
import Comment from './Comment';

describe('Comment', () => {
    test('renders an author avatar when provided', () => {
        render(<Comment comment={{ id: 'c1', body: 'With avatar', author: { username: 'grace', avatar: 'https://example.com/grace.jpg' } }} />);

        expect(screen.getByRole('img', { name: 'grace' })).toHaveAttribute('src', 'https://example.com/grace.jpg');
    });

    test('renders no avatar image when author has no avatar', () => {
        const { container } = render(<Comment comment={{ id: 'c2', body: 'No avatar', author: { username: 'no-photo' } }} />);

        expect(screen.getByText('no-photo')).toBeInTheDocument();
        expect(container.querySelector('img')).toBeNull();
    });
});
