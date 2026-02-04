export default function Loading({ message = "Loading..." }) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="loading-dots mb-4 justify-center">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <p className="text-white/70 text-lg">{message}</p>
            </div>
        </div>
    )
}
