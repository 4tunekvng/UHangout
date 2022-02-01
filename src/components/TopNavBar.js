import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'

import SearchBar from './SearchBar'
import SignInButton from './SignInButton'
import SignOutButton from './SignOutButton'
  
const TopNavBar = ({ isLoggedIn, setQuery }) => {
  return (
    <Box sx={{ flexGrow: 1, paddingBottom: 3 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, paddingLeft: 3 }}>
            UHangout
          </Typography>
          <SearchBar setQuery={setQuery} />
          {isLoggedIn ? <SignOutButton /> : <SignInButton />}
        </Toolbar>
      </AppBar>
    </Box>
  )
}

export default TopNavBar