import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { signIn } from 'next-auth/react'
import LoginPage from '../login/page'

jest.mock('next-auth/react')

const mockSignIn = signIn as jest.MockedFunction<typeof signIn>

describe('LoginPage', () => {
  beforeEach(() => {
    mockSignIn.mockClear()
  })

  it('renders login form', () => {
    render(<LoginPage />)
    
    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Author' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Admin' })).toBeInTheDocument()
  })

  it('allows user type selection', () => {
    render(<LoginPage />)
    
    const adminButton = screen.getByRole('button', { name: 'Admin' })
    const authorButton = screen.getByRole('button', { name: 'Author' })
    
    fireEvent.click(adminButton)
    expect(adminButton).toHaveClass('bg-blue-600')
    expect(authorButton).not.toHaveClass('bg-blue-600')
    
    fireEvent.click(authorButton)
    expect(authorButton).toHaveClass('bg-blue-600')
    expect(adminButton).not.toHaveClass('bg-blue-600')
  })

  it('handles form submission', async () => {
    mockSignIn.mockResolvedValue({ error: null, status: 200, ok: true, url: null })
    
    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign in' })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        userType: 'author',
        redirect: false,
      })
    })
  })

  it('displays error message on failed login', async () => {
    mockSignIn.mockResolvedValue({ error: 'Invalid credentials', status: 401, ok: false, url: null })
    
    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign in' })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('shows loading state during submission', async () => {
    mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ error: null, status: 200, ok: true, url: null }), 100)))
    
    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign in' })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    expect(screen.getByText('Signing in...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })
})