enum BongoState {
	LEFT = 'left',
	RIGHT = 'right'
}

function* getBongoState() {
	let current = BongoState.LEFT;
	while (true) {
		if (current === BongoState.LEFT) {
			current = BongoState.RIGHT;
			yield BongoState.RIGHT;
		} else {
			current = BongoState.LEFT;
			yield BongoState.LEFT;
		}
	}
}

export { BongoState };