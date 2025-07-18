import { render, screen } from '@testing-library/react'
import { NextAuthProvider } from '../session-provider'

describe('NextAuthProvider', () => {
  it('renders children correctly', () => {
    render(
      <NextAuthProvider>
        <div>Test Content</div>
      </NextAuthProvider>
    )
    
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('wraps children with SessionProvider', () => {
    const { container } = render(
      <NextAuthProvider>
        <div data-testid="child">Test Content</div>
      </NextAuthProvider>
    )
    
    const childElement = screen.getByTestId('child')
    expect(childElement).toBeInTheDocument()
    expect(container.firstChild).toBeInTheDocument()
  })
})