export default function JobPostForm() {
  return (
    <form className="space-y-4">
      <input
        type="text"
        placeholder="Job Title"
        className="w-full border rounded px-4 py-2"
      />
      <textarea
        placeholder="Job Description"
        className="w-full border rounded px-4 py-2"
        rows="5"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-6 py-2 rounded"
      >
        Post Job
      </button>
    </form>
  )
}
