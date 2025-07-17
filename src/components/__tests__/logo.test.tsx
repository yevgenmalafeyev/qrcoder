import { render, screen } from '@testing-library/react'
import { Logo, LogoWithText } from '../logo'

describe('Logo', () => {
  it('renders logo correctly', () => {
    render(<Logo />)
    const logo = screen.getByRole('img', { hidden: true })
    expect(logo).toBeInTheDocument()
  })

  it('applies correct size classes', () => {
    const { container } = render(<Logo size="lg" />)
    expect(container.firstChild).toHaveClass('h-12 w-12')
  })

  it('applies custom className', () => {
    const { container } = render(<Logo className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})

describe('LogoWithText', () => {
  it('renders logo with text', () => {
    render(<LogoWithText />)
    expect(screen.getByText('QRCoder')).toBeInTheDocument()
  })

  it('applies correct text size for different sizes', () => {
    render(<LogoWithText size="lg" />)
    expect(screen.getByText('QRCoder')).toHaveClass('text-2xl')
  })
})