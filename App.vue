<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

	<style>
	page {
		background: #F7F9F4;
		color: #20312C;
		font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
	}
	button::after { border: none; }
	.lc-page { min-height: 100vh; box-sizing: border-box; padding: 28rpx 28rpx 60rpx; }
	.lc-card { background: #FFFFFF; border-radius: 28rpx; box-shadow: 0 14rpx 36rpx rgba(47, 91, 75, .08); }
	.lc-primary { background: #27B786; color: #FFFFFF; border-radius: 24rpx; font-weight: 600; }
	.lc-secondary { background: #E4F7EF; color: #167858; border-radius: 24rpx; font-weight: 600; }
	.lc-muted { color: #81918B; }
	.lc-empty { padding: 70rpx 30rpx; text-align: center; color: #92A09B; }
	</style>
