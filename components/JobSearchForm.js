export default function JobSearchForm() {
  return (
    <form className="flex gap-4">
      <input
        type="text"
        placeholder="Search jobs..."
        className="flex-1 border rounded px-4 py-2"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-6 py-2 rounded"
      >
        Search
      </button>
    </form>
  )
}
