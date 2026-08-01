/* eslint-disable react/prop-types */
import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    try {
      console.error('ErrorBoundary caught error:', error, info)
    } catch (e) {
      console.error('Error in componentDidCatch:', e)
    }
  }

  render() {
    try {
      if (this.state.hasError) {
        return (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--deep-green)' }}>
            <h2>Something went wrong.</h2>
            <p>{this.state.error && this.state.error.message}</p>
            <button className="primary-action-btn" onClick={() => window.location.reload()}>
              Reload
            </button>
          </div>
        )
      }
      return this.props.children
    } catch (e) {
      console.error('Error in ErrorBoundary render:', e)
      return null
    }
  }
}
