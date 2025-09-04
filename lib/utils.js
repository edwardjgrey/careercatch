export function formatDate(date) {
  return new Date(date).toLocaleDateString()
}

export function formatSalary(amount, currency) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD'
  }).format(amount)
}
