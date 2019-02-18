export const fluidContainer = {
    width: '100%',
    height: '100%'
}
export const flexContainer = { flex: 1 }
export const centeredText = {
    textAlignVertical: "center",
    textAlign: "center",
}
export const fullWidthCenterAlignedFlexContainer = {
    ...flexContainer,
    ...centeredFlexContainer
}
export const centeredFlexContainer = {
    justifyContent: 'center',
    alignItems: 'center',
}
export const fullScreenAbsoluteContainer = {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
}