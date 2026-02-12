from algopy import ARC4Contract, arc4, String, UInt64, BoxMap, Global, Txn, Bytes

class ClubVoting(ARC4Contract):
    def __init__(self) -> None:
        # Candidate votes
        self.candidates = BoxMap(String, UInt64)  # "club:name:position" -> votes
        self.candidate_list = BoxMap(String, String)  # "club:position:index" -> name
        self.candidate_count = BoxMap(String, UInt64)  # "club:position" -> count
        
        # Election management
        self.election_start = BoxMap(String, UInt64)  # "club:position" -> timestamp
        self.election_duration = BoxMap(String, UInt64)  # "club:position" -> duration in seconds
        self.election_active = BoxMap(String, UInt64)  # "club:position" -> 1 if active, 0 if inactive
        
        # Voting tracking (prevent double voting)
        self.voters = BoxMap(String, UInt64)  # "club:position:voter_address" -> 1 if voted
        
        self.admin = Global.creator_address

    @arc4.abimethod
    def add_candidate(self, club: String, name: String, position: String) -> None:
        """Admin adds a candidate to a club's election"""
        assert Txn.sender == self.admin, "Only the admin can add candidates"
        
        key = club + String(":") + position + String(":") + str(self.candidate_count[club + String(":") + position])
        self.candidate_list[key] = name
        self.candidates[club + String(":") + name + String(":") + position] = UInt64(0)
        self.candidate_count[club + String(":") + position] = self.candidate_count[club + String(":") + position] + UInt64(1)

    @arc4.abimethod
    def delete_candidate(self, club: String, name: String, position: String) -> None:
        """Admin removes a candidate from election"""
        assert Txn.sender == self.admin, "Only the admin can delete candidates"
        
        key = club + String(":") + name + String(":") + position
        del self.candidates[key]

    @arc4.abimethod
    def set_election_duration(self, club: String, position: String, duration_seconds: UInt64) -> None:
        """Admin sets the duration of an election in seconds"""
        assert Txn.sender == self.admin, "Only the admin can set election duration"
        
        self.election_duration[club + String(":") + position] = duration_seconds
        self.election_start[club + String(":") + position] = Global.latest_timestamp
        self.election_active[club + String(":") + position] = UInt64(1)

    @arc4.abimethod
    def start_election(self, club: String, position: String) -> None:
        """Admin starts an election"""
        assert Txn.sender == self.admin, "Only the admin can start elections"
        
        self.election_start[club + String(":") + position] = Global.latest_timestamp
        self.election_active[club + String(":") + position] = UInt64(1)

    @arc4.abimethod
    def end_election(self, club: String, position: String) -> None:
        """Admin ends an election"""
        assert Txn.sender == self.admin, "Only the admin can end elections"
        
        self.election_active[club + String(":") + position] = UInt64(0)

    @arc4.abimethod
    def vote(self, club: String, candidate_name: String, position: String) -> None:
        """User votes for a candidate"""
        voter_key = club + String(":") + position + String(":") + Txn.sender.bytes
        
        # Check if voting period is active
        assert self.election_active[club + String(":") + position] == UInt64(1), "Election is not active"
        
        # Check if voter has already voted
        assert not (voter_key in self.voters), "You have already voted in this election"
        
        # Check if election hasn't expired
        start_time = self.election_start[club + String(":") + position]
        duration = self.election_duration[club + String(":") + position]
        assert Global.latest_timestamp <= (start_time + duration), "Election voting period has ended"
        
        # Record the vote
        candidate_key = club + String(":") + candidate_name + String(":") + position
        self.candidates[candidate_key] = self.candidates[candidate_key] + UInt64(1)
        
        # Mark voter as voted
        self.voters[voter_key] = UInt64(1)

    @arc4.abimethod
    def get_candidate_votes(self, club: String, candidate_name: String, position: String) -> UInt64:
        """Get vote count for a specific candidate"""
        key = club + String(":") + candidate_name + String(":") + position
        votes = self.candidates[key]
        return votes if votes is not None else UInt64(0)

    @arc4.abimethod
    def is_election_active(self, club: String, position: String) -> UInt64:
        """Check if election is currently active"""
        return self.election_active[club + String(":") + position]

    @arc4.abimethod
    def get_election_info(self, club: String, position: String) -> tuple[UInt64, UInt64, UInt64]:
        """Get election info: (start_time, duration_seconds, is_active)"""
        key_prefix = club + String(":") + position
        start = self.election_start[key_prefix]
        duration = self.election_duration[key_prefix]
        active = self.election_active[key_prefix]
        return (start, duration, active)