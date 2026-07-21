import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="text-center py-5">
      <h1 className="display-1 fw-bold">404</h1>
      <p className="lead">That game doesn't exist.</p>
      <Link to="/" className="btn btn-primary">
        Back to games
      </Link>
    </div>
  )
}
