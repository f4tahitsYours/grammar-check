export const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&_-])[A-Za-z\d@$!%*#?&_-]{8,16}$/

export const triggerShake = (
    setter: React.Dispatch<React.SetStateAction<boolean>>
) => {

    setter(false)

    setTimeout(() => {
        setter(true)
    }, 10)

    setTimeout(() => {
        setter(false)
    }, 450)
}