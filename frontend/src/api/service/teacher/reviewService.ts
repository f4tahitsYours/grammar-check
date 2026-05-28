import api from '../../axios'

export const getPendingReviews = async () => {

    const response = await api.get(
        '/teacher/pending-reviews'
    )

    return response.data
}